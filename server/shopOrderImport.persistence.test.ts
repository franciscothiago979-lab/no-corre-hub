import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { importShopOrder } from "./db";

const fetchMock = vi.fn();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("persistência do pedido recebido da No Corre Shop", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubEnv("SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("cria contato e pedido no módulo orders que alimenta a tela Pedidos", async () => {
    fetchMock
      .mockResolvedValueOnce(json([])) // pedidos existentes
      .mockResolvedValueOnce(json([])) // contatos existentes
      .mockResolvedValueOnce(json([])) // próximo id do contato
      .mockResolvedValueOnce(json([{ record_id: 1 }], 201)) // contato criado
      .mockResolvedValueOnce(json([])) // próximo id do pedido
      .mockResolvedValueOnce(json([{ record_id: 1 }], 201)); // pedido criado

    const result = await importShopOrder("owner-test", {
      externalId: "NC-ERP-PERSIST-001",
      customer: { name: "Contato da loja", phone: "11999990000", email: "contato@loja.test" },
      items: [{ name: "Camiseta No Corre", variant: "Preto · G", quantity: 2, unitPriceCents: 4599 }],
      totalCents: 9198,
      paymentStatus: "paid",
      paymentMethod: "pix",
      notes: "Pedido vindo da loja",
    });

    expect(result).toMatchObject({ duplicate: false, order: {
      id: 1,
      customerName: "Contato da loja",
      total: 91.98,
      source: "no-corre-shop",
      externalId: "NC-ERP-PERSIST-001",
      status: "in_production",
    } });
    expect(fetchMock).toHaveBeenCalledTimes(6);

    const orderCreation = fetchMock.mock.calls[5];
    expect(String(orderCreation[0])).toContain("erp_records");
    const orderBody = JSON.parse(String(orderCreation[1]?.body));
    expect(orderBody[0]).toMatchObject({
      owner_open_id: "owner-test",
      module: "orders",
      record_id: 1,
      data: expect.objectContaining({ externalId: "NC-ERP-PERSIST-001", source: "no-corre-shop" }),
    });
  });
});
