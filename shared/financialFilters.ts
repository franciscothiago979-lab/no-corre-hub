import type { FinancialDueRecord } from "./financialDueDates";

export type FinancialFilters = {
  status: "all" | "pending" | "settled";
  type: "all" | "income" | "expense";
  period: "all" | "overdue" | "next_7_days" | "current_month";
};

function dateKey(record: FinancialDueRecord) {
  return record.dueDate?.slice(0, 10) || record.createdAt?.slice(0, 10) || "";
}

export function filterFinancialRecords<T extends FinancialDueRecord>(records: T[], filters: FinancialFilters, referenceDate = new Date().toISOString().slice(0, 10)): T[] {
  const endDate = new Date(`${referenceDate}T12:00:00`);
  endDate.setDate(endDate.getDate() + 7);
  const endKey = endDate.toISOString().slice(0, 10);
  const currentMonth = referenceDate.slice(0, 7);

  return records.filter((record) => {
    const status = record.settlementStatus === "pending" ? "pending" : "settled";
    const recordDate = dateKey(record);
    const statusMatches = filters.status === "all" || status === filters.status;
    const typeMatches = filters.type === "all" || record.type === filters.type;
    const periodMatches = filters.period === "all"
      || (filters.period === "overdue" && status === "pending" && Boolean(recordDate) && recordDate < referenceDate)
      || (filters.period === "next_7_days" && status === "pending" && Boolean(recordDate) && recordDate >= referenceDate && recordDate <= endKey)
      || (filters.period === "current_month" && recordDate.startsWith(currentMonth));
    return statusMatches && typeMatches && periodMatches;
  });
}

function normalizeSearchValue(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

export function searchFinancialRecords<T extends FinancialDueRecord & { description?: string }>(records: T[], query: string): T[] {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return records;
  return records.filter((record) => normalizeSearchValue(record.description || "").includes(normalizedQuery));
}

export function getFinancialFilterSummary(records: FinancialDueRecord[]) {
  const income = records.filter((record) => record.type === "income").reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const expenses = records.filter((record) => record.type === "expense").reduce((sum, record) => sum + Number(record.amount || 0), 0);
  return { income, expenses, balance: income - expenses, count: records.length };
}
