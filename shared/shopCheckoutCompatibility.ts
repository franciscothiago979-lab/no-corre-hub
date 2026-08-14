import type { ShopOrderPayload } from "./shopOrderSync";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : null;
}

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asNonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

function asPositiveInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

function normalizeCanonicalOrder(input: UnknownRecord): ShopOrderPayload | null {
  const externalId = asNonEmptyString(input.externalId);
  const totalCents = asNonNegativeInteger(input.totalCents);
  const customer = asRecord(input.customer);
  if (!externalId || totalCents === null || !customer || !asNonEmptyString(customer.name) || !Array.isArray(input.items) || input.items.length === 0) return null;

  const items = input.items.map((item) => {
    const row = asRecord(item);
    if (!row) return null;
    const name = asNonEmptyString(row.name);
    const quantity = asPositiveInteger(row.quantity);
    const unitPriceCents = asNonNegativeInteger(row.unitPriceCents);
    if (!name || quantity === null || unitPriceCents === null) return null;
    return { name, variant: asNonEmptyString(row.variant), quantity, unitPriceCents };
  });
  if (items.some((item) => !item)) return null;

  return {
    externalId,
    customer: {
      name: asNonEmptyString(customer.name)!,
      phone: asNonEmptyString(customer.phone),
      email: asNonEmptyString(customer.email),
      city: asNonEmptyString(customer.city),
    },
    items: items as ShopOrderPayload["items"],
    totalCents,
    shippingCents: asNonNegativeInteger(input.shippingCents) ?? undefined,
    discountCents: asNonNegativeInteger(input.discountCents) ?? undefined,
    paymentMethod: asNonEmptyString(input.paymentMethod),
    paymentStatus: input.paymentStatus === "paid" || input.paymentStatus === "failed" || input.paymentStatus === "pending" ? input.paymentStatus : "pending",
    notes: asNonEmptyString(input.notes),
    submittedAt: asNonEmptyString(input.submittedAt) ?? undefined,
  };
}

/**
 * Converts the checkout payload deployed by No Corre Shop to the ERP's internal
 * order contract. Canonical ERP payloads remain accepted for backwards compatibility.
 */
export function normalizeShopCheckoutPayload(input: unknown): ShopOrderPayload | null {
  const order = asRecord(input);
  if (!order) return null;

  const canonical = normalizeCanonicalOrder(order);
  if (canonical) return canonical;

  const externalId = asNonEmptyString(order.externalOrderId);
  const totals = asRecord(order.totals);
  const customer = asRecord(order.customer);
  if (!externalId || !totals || !customer || !Array.isArray(order.items) || order.items.length === 0) return null;
  const totalCents = asNonNegativeInteger(totals.totalCents);
  const customerName = asNonEmptyString(customer.name);
  if (totalCents === null || !customerName) return null;

  const items = order.items.map((item) => {
    const row = asRecord(item);
    if (!row) return null;
    const name = asNonEmptyString(row.name);
    const color = asNonEmptyString(row.colorName);
    const size = asNonEmptyString(row.size);
    const quantity = asPositiveInteger(row.quantity);
    const unitPriceCents = asNonNegativeInteger(row.unitPriceCents);
    if (!name || quantity === null || unitPriceCents === null) return null;
    const variant = [color, size].filter(Boolean).join(" · ") || null;
    return { name, variant, quantity, unitPriceCents };
  });
  if (items.some((item) => !item)) return null;

  const orderSummary = asNonEmptyString(order.orderSummary);
  const customerNotes = asNonEmptyString(customer.notes);
  const notes = [orderSummary, customerNotes].filter(Boolean).join("\n") || null;

  return {
    externalId,
    customer: {
      name: customerName,
      phone: asNonEmptyString(customer.phone),
      email: asNonEmptyString(customer.email),
    },
    items: items as ShopOrderPayload["items"],
    totalCents,
    shippingCents: asNonNegativeInteger(totals.shippingCents) ?? undefined,
    discountCents: asNonNegativeInteger(totals.discountCents) ?? undefined,
    paymentStatus: "pending",
    notes,
  };
}
