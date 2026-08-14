export type OperationalPriorityInput = {
  orders: Array<{ id: number; customerName?: string; status: string }>;
  stockItems: Array<{ id: number; name: string; quantity: number; minimumQuantity: number }>;
  income: number;
  expenses: number;
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

export function getOperationalPriorities(input: OperationalPriorityInput): OperationalPriority[] {
  const priorities: OperationalPriority[] = [];
  const awaitingPayment = input.orders.filter((order) => order.status === "awaiting_payment");
  const inProduction = input.orders.filter((order) => order.status === "in_production");
  const lowStock = input.stockItems.filter((item) => Number(item.quantity) <= Number(item.minimumQuantity));
  const balance = Number(input.income) - Number(input.expenses);

  if (balance < 0) {
    priorities.push({ id: "negative-balance", title: "Saldo operacional negativo", description: `Despesas superam receitas em ${Math.abs(balance).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`, route: "/financeiro", actionLabel: "Revisar financeiro", tone: "red", severity: 1 });
  }
  if (awaitingPayment.length) {
    priorities.push({ id: "awaiting-payment", title: `${awaitingPayment.length} pedido(s) aguardando pagamento`, description: "Confirme os recebimentos para manter o fluxo financeiro atualizado.", route: "/pedidos", actionLabel: "Ver pedidos", tone: "amber", severity: 2 });
  }
  if (lowStock.length) {
    priorities.push({ id: "low-stock", title: `${lowStock.length} item(ns) no estoque mínimo`, description: lowStock.slice(0, 2).map((item) => item.name).join(", ") + (lowStock.length > 2 ? " e outros" : ""), route: "/estoque", actionLabel: "Conferir estoque", tone: "red", severity: 3 });
  }
  if (inProduction.length) {
    priorities.push({ id: "in-production", title: `${inProduction.length} pedido(s) em produção`, description: "Acompanhe o andamento para manter os prazos combinados.", route: "/producao", actionLabel: "Abrir produção", tone: "blue", severity: 4 });
  }

  return priorities.sort((left, right) => left.severity - right.severity);
}
