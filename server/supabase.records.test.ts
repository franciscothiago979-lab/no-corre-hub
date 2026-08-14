import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createProduct, deleteOrder, deleteProduct, deleteStockItem, deleteTransaction, listProducts, updateOrder, updateStockItem, updateTransaction } from "./db";

const response = (data: unknown) => ({ ok: true, json: async () => data }) as Response;

describe("registros estruturados no Supabase", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://nch-test.supabase.co/rest/v1/");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key-test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("lista produtos e normaliza o identificador e os carimbos de data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response([{ record_id: "7", data: { name: "Camiseta", category: "Malhas", sku: "CAM-01", price: 59.9, stock: 12, minimumStock: 3 }, created_at: "2026-08-12T12:00:00.000Z", updated_at: "2026-08-12T13:00:00.000Z" }]));
    vi.stubGlobal("fetch", fetchMock);

    const products = await listProducts("owner-test");

    expect(products).toEqual([expect.objectContaining({ id: 7, name: "Camiseta", createdAt: "2026-08-12T12:00:00.000Z" })]);
    expect(String(fetchMock.mock.calls[0][0])).toContain("https://nch-test.supabase.co/rest/v1/erp_records?");
    expect(String(fetchMock.mock.calls[0][0])).toContain("module=eq.products");
  });

  it("cria e exclui um produto no módulo correto", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response([{ record_id: 4 }]))
      .mockResolvedValueOnce(response([{ record_id: 5, data: {}, created_at: "2026-08-12T12:00:00.000Z", updated_at: "2026-08-12T12:00:00.000Z" }]))
      .mockResolvedValueOnce(response([{ record_id: 5 }]));
    vi.stubGlobal("fetch", fetchMock);

    const created = await createProduct("owner-test", { name: "Caneca", category: "Sublimação", sku: "CAN-01", variations: "", price: 35, stock: 4, minimumStock: 1 });
    const deleted = await deleteProduct("owner-test", 5);

    expect(created.id).toBe(5);
    expect(deleted).toEqual({ success: true });
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual([expect.objectContaining({ owner_open_id: "owner-test", module: "products", record_id: 5 })]);
    expect(String(fetchMock.mock.calls[2][0])).toContain("record_id=eq.5");
    expect(fetchMock.mock.calls[2][1]?.method).toBe("DELETE");
  });

  it("atualiza e exclui pedidos, estoque e financeiro nos módulos corretos", async () => {
    const createdAt = "2026-08-12T12:00:00.000Z";
    const updatedAt = "2026-08-12T13:00:00.000Z";
    const row = (recordId: number, data: object) => ({ record_id: recordId, data, created_at: createdAt, updated_at: updatedAt });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response([row(10, { customerName: "Cliente", itemsDescription: "10 camisetas", total: 250, status: "awaiting_payment" })]))
      .mockResolvedValueOnce(response([row(10, { customerName: "Cliente editado", itemsDescription: "10 camisetas", total: 270, status: "in_production" })]))
      .mockResolvedValueOnce(response([{ record_id: 10 }]))
      .mockResolvedValueOnce(response([row(20, { name: "Tinta", category: "Insumos", quantity: 2, minimum: 1, cost: 35 })]))
      .mockResolvedValueOnce(response([row(20, { name: "Tinta", category: "Insumos", quantity: 4, minimum: 1, cost: 35 })]))
      .mockResolvedValueOnce(response([{ record_id: 20 }]))
      .mockResolvedValueOnce(response([row(30, { description: "Venda", type: "income", amount: 200 })]))
      .mockResolvedValueOnce(response([row(30, { description: "Venda revisada", type: "income", amount: 220 })]))
      .mockResolvedValueOnce(response([{ record_id: 30 }]));
    vi.stubGlobal("fetch", fetchMock);

    await updateOrder("owner-test", 10, { customerName: "Cliente editado", itemsDescription: "10 camisetas", total: 270, status: "in_production" });
    await deleteOrder("owner-test", 10);
    await updateStockItem("owner-test", 20, { name: "Tinta", category: "Insumos", quantity: 4, minimum: 1, cost: 35 });
    await deleteStockItem("owner-test", 20);
    await updateTransaction("owner-test", 30, { description: "Venda revisada", type: "income", amount: 220 });
    await deleteTransaction("owner-test", 30);

    expect(String(fetchMock.mock.calls[1][0])).toContain("module=eq.orders");
    expect(fetchMock.mock.calls[1][1]?.method).toBe("PATCH");
    expect(String(fetchMock.mock.calls[2][0])).toContain("module=eq.orders");
    expect(fetchMock.mock.calls[2][1]?.method).toBe("DELETE");
    expect(String(fetchMock.mock.calls[4][0])).toContain("module=eq.stock");
    expect(fetchMock.mock.calls[4][1]?.method).toBe("PATCH");
    expect(String(fetchMock.mock.calls[5][0])).toContain("module=eq.stock");
    expect(fetchMock.mock.calls[5][1]?.method).toBe("DELETE");
    expect(String(fetchMock.mock.calls[7][0])).toContain("module=eq.transactions");
    expect(fetchMock.mock.calls[7][1]?.method).toBe("PATCH");
    expect(String(fetchMock.mock.calls[8][0])).toContain("module=eq.transactions");
    expect(fetchMock.mock.calls[8][1]?.method).toBe("DELETE");
  });
});
