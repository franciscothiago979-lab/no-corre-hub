import { Download, FileDown, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { operationalSummaryCsv, recordsToCsv, type ExportColumn } from "../../../shared/operationalExport";

const columns: Record<string, ExportColumn[]> = {
  contacts: [{ key: "name", label: "Nome" }, { key: "phone", label: "Telefone" }, { key: "email", label: "E-mail" }, { key: "city", label: "Cidade" }, { key: "type", label: "Tipo" }, { key: "status", label: "Status" }],
  products: [{ key: "name", label: "Produto" }, { key: "category", label: "Categoria" }, { key: "sku", label: "SKU" }, { key: "price", label: "Preço" }, { key: "stock", label: "Estoque" }, { key: "minimumStock", label: "Estoque mínimo" }],
  orders: [{ key: "customerName", label: "Cliente" }, { key: "itemsDescription", label: "Itens" }, { key: "total", label: "Total" }, { key: "status", label: "Status" }, { key: "createdAt", label: "Criado em" }],
  stock: [{ key: "name", label: "Item" }, { key: "category", label: "Categoria" }, { key: "quantity", label: "Quantidade" }, { key: "minimumQuantity", label: "Quantidade mínima" }, { key: "unitCost", label: "Custo unitário" }],
  finance: [{ key: "description", label: "Descrição" }, { key: "type", label: "Tipo" }, { key: "amount", label: "Valor" }, { key: "dueDate", label: "Vencimento" }, { key: "settlementStatus", label: "Situação" }, { key: "createdAt", label: "Criado em" }],
};

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function OperationalExportPanel() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const queryOptions = { enabled: isAuthenticated && !authLoading };
  const contacts = trpc.customers.list.useQuery(undefined, queryOptions);
  const products = trpc.products.list.useQuery(undefined, queryOptions);
  const orders = trpc.orders.list.useQuery(undefined, queryOptions);
  const stock = trpc.stock.list.useQuery(undefined, queryOptions);
  const finance = trpc.finance.list.useQuery(undefined, queryOptions);
  const isLoading = [contacts, products, orders, stock, finance].some((query) => query.isLoading);
  const sources = { contacts: contacts.data ?? [], products: products.data ?? [], orders: orders.data ?? [], stock: stock.data ?? [], finance: finance.data ?? [] };
  const exportRows = (key: keyof typeof sources, filename: string) => {
    downloadCsv(filename, recordsToCsv(sources[key] as unknown as Array<Record<string, unknown>>, columns[key]));
    toast.success("Arquivo CSV preparado para download.");
  };
  const exportSummary = () => {
    const income = sources.finance.filter((item) => item.type === "income").reduce((total, item) => total + Number(item.amount), 0);
    const expenses = sources.finance.filter((item) => item.type === "expense").reduce((total, item) => total + Number(item.amount), 0);
    downloadCsv("no-corre-resumo-operacional.csv", operationalSummaryCsv({ customers: sources.contacts.length, products: sources.products.length, orders: sources.orders.length, stockItems: sources.stock.length, income, expenses }));
    toast.success("Resumo operacional preparado para download.");
  };
  const items: Array<[keyof typeof sources, string, string]> = [["contacts", "Contatos", "no-corre-contatos.csv"], ["products", "Produtos", "no-corre-produtos.csv"], ["orders", "Pedidos", "no-corre-pedidos.csv"], ["stock", "Estoque", "no-corre-estoque.csv"], ["finance", "Financeiro", "no-corre-financeiro.csv"]];
  return <section className="mt-6 max-w-4xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#b7dfe3]/70"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-3"><div className="rounded-xl bg-teal-50 p-3 text-[#0f6b78]"><FileDown className="h-5 w-5" /></div><div><h2 className="font-extrabold text-slate-950">Central de exportação</h2><p className="mt-1 text-sm text-slate-500">Baixe cópias dos seus registros para análise e continuidade operacional.</p></div></div><span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Dados da sua conta</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(([key, label, filename]) => <button key={key} type="button" disabled={isLoading} onClick={() => exportRows(key, filename)} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:border-[#0f6b78] hover:bg-teal-50 disabled:cursor-wait disabled:opacity-60"><span>{label}</span><Download className="h-4 w-4 text-[#0f6b78]" /></button>)}</div><button type="button" disabled={isLoading} onClick={exportSummary} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f6b78] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b5964] disabled:cursor-wait disabled:opacity-60"><Download className="h-4 w-4" /> Exportar resumo operacional consolidado</button><p className="mt-3 text-xs text-slate-500">Os arquivos são gerados localmente a partir dos registros disponíveis nesta sessão. Credenciais, configurações técnicas e dados de outros usuários não são incluídos.</p></section>;
}
