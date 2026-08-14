export type FinancialDueRecord = {
  id: number;
  description: string;
  type: "income" | "expense";
  amount: number;
  dueDate?: string | null;
  settlementStatus?: "pending" | "settled" | null;
  createdAt?: string;
};

function toDateKey(record: FinancialDueRecord) {
  return record.dueDate?.slice(0, 10) || record.createdAt?.slice(0, 10) || "";
}

export function getFinancialDueSummary(records: FinancialDueRecord[], referenceDate = new Date().toISOString().slice(0, 10)) {
  const endDate = new Date(`${referenceDate}T12:00:00`);
  endDate.setDate(endDate.getDate() + 7);
  const endKey = endDate.toISOString().slice(0, 10);
  const pending = records.filter((record) => record.settlementStatus === "pending" && Boolean(toDateKey(record)));
  const overdue = pending.filter((record) => toDateKey(record) < referenceDate);
  const upcoming = pending.filter((record) => {
    const date = toDateKey(record);
    return date >= referenceDate && date <= endKey;
  });
  const total = (items: FinancialDueRecord[]) => items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    overdue,
    upcoming,
    overdueTotal: total(overdue),
    upcomingTotal: total(upcoming),
    pendingTotal: total(pending),
    hasAlerts: overdue.length > 0 || upcoming.length > 0,
  };
}
