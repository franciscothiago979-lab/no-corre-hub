export type OperationalPriorityInput = {
  orders: Array<{ id: number; customerName?: string; status: string; createdAt?: string }>;
  stockItems: Array<{ id: number; name: string; quantity: number; minimumQuantity: number }>;
  products?: Array<{ id: number; name: string; stock: number; minimumStock: number; variations?: string }>;
  income: number;
  expenses: number;
  now?: Date;
};

export type OperationalPriority = {
  id: string;
  title: string;
  description: string;
  route: string;
  actionLabel: string;
  tone: "red" | "amber" | "blue";
  severity: number;
};

function getLowStockVariants(products: NonNullable<OperationalPriorityInput["products"]>) {
  return products.flatMap((product) => {
    try {
      const variations = JSON.parse(product.variations ?? "[]") as Array<{ title?: unknown; stock?: unknown; options?: Record<string, unknown> }>;
      if (!Array.isArray(variations)) return [];
      return variations.flatMap((variant) => {
        const stock = Number(variant.stock);
        if (!Number.isFinite(stock) || stock > Number(product.minimumStock)) return [];
        const optionLabel = variant.options ? [variant.options.Tamanho, variant.options.Cor].filter((value): value is string => typeof value === "string" && Boolean(value.trim())).join(" / ") : "";
        return [{ name: product.name, variant: String(variant.title ?? (optionLabel || "Variação")), stock }];
      });
    } catch { return []; }
  });
}

export function getOperationalPriorities(input: OperationalPriorityInput): OperationalPriority[] {
  const priorities: OperationalPriority[] = [];
  const awaitingPayment = input.orders.filter((order) => order.status === "awaiting_payment");
  const now = input.now ?? new Date();
  const unconfirmedOrders = awaitingPayment.filter((order) => {
    const createdAt = order.createdAt ? new Date(order.createdAt).getTime() : Number.NaN;
    return Number.isFinite(createdAt) && now.getTime() - createdAt >= 2 * 60 * 60 * 1000;
  });
  const inProduction = input.orders.filter((order) => order.status === "in_production");
  const lowStock = input.stockItems.filter((item) => Number(item.quantity) <= Number(item.minimumQuantity));
  const lowVariantStock = getLowStockVariants(input.products ?? []);
  const balance = Number(input.income) - Number(input.expenses);

  if (balance < 0) {
    priorities.push({ id: "negative-balance", title: "Saldo operacional negativo", description: `Despesas superam receitas em ${Math.abs(balance).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`, route: "/financeiro", actionLabel: "Revisar financeiro", tone: "red", severity: 1 });
  }
  if (awaitingPayment.length) {
    priorities.push({ id: "awaiting-payment", title: `${awaitingPayment.length} pedido(s) aguardando pagamento`, description: "Confirme os recebimentos para manter o fluxo financeiro atualizado.", route: "/pedidos", actionLabel: "Ver pedidos", tone: "amber", severity: 2 });
  }
  if (unconfirmedOrders.length) {
    priorities.push({ id: "unconfirmed-orders", title: `${unconfirmedOrders.length} pedido(s) sem confirmação há mais de 2h`, description: unconfirmedOrders.slice(0, 2).map((order) => order.customerName || `Pedido #${order.id}`).join(", ") + (unconfirmedOrders.length > 2 ? " e outros" : ""), route: "/pedidos", actionLabel: "Confirmar pedidos", tone: "amber", severity: 2.5 });
  }
  if (lowStock.length) {
    priorities.push({ id: "low-stock", title: `${lowStock.length} item(ns) no estoque mínimo`, description: lowStock.slice(0, 2).map((item) => item.name).join(", ") + (lowStock.length > 2 ? " e outros" : ""), route: "/estoque", actionLabel: "Conferir estoque", tone: "red", severity: 3 });
  }
  if (lowVariantStock.length) {
    priorities.push({ id: "low-variant-stock", title: `${lowVariantStock.length} variante(s) com estoque crítico`, description: lowVariantStock.slice(0, 2).map((item) => `${item.name} · ${item.variant} (${item.stock})`).join(", ") + (lowVariantStock.length > 2 ? " e outras" : ""), route: "/produtos", actionLabel: "Repor variantes", tone: "red", severity: 3.5 });
  }
  if (inProduction.length) {
    priorities.push({ id: "in-production", title: `${inProduction.length} pedido(s) em produção`, description: "Acompanhe o andamento para manter os prazos combinados.", route: "/producao", actionLabel: "Abrir produção", tone: "blue", severity: 4 });
  }

  return priorities.sort((left, right) => left.severity - right.severity);
}
