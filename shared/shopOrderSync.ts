export type ShopOrderItem = {
  sku?: string | null;
  variantId?: string | null;
  name: string;
  variant?: string | null;
  quantity: number;
  unitPriceCents: number;
};

export type ShopOrderPayload = {
  externalId: string;
  customer: {
    name: string;
    phone?: string | null;
    email?: string | null;
    city?: string | null;
  };
  items: ShopOrderItem[];
  totalCents: number;
  shippingCents?: number;
  discountCents?: number;
  paymentMethod?: string | null;
  paymentStatus?: "pending" | "paid" | "failed";
  notes?: string | null;
  submittedAt?: string;
};

export type ImportedShopOrder = {
  externalId?: string | null;
  source?: string | null;
};

export function isDuplicateShopOrder(orders: ImportedShopOrder[], externalId: string) {
  return orders.some((order) => order.source === "no-corre-shop" && order.externalId === externalId);
}

export function describeShopOrderItems(items: ShopOrderItem[]) {
  return items
    .map((item) => `${item.quantity}× ${item.name}${item.variant ? ` (${item.variant})` : ""}`)
    .join(" · ");
}

export function toCurrencyValue(cents: number) {
  return Math.round(cents) / 100;
}
