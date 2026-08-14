export type ErpCatalogProduct = {
  id: number;
  name: string;
  category: string;
  sku: string;
  variations?: string;
  price: number;
  stock: number;
  minimumStock: number;
  updatedAt: string;
};

export type ShopCatalogProduct = {
  erpProductId: number;
  sku: string;
  name: string;
  category: string;
  priceCents: number;
  stock: number;
  minimumStock: number;
  available: boolean;
  variations: string;
  updatedAt: string;
};

export function toShopCatalog(products: ErpCatalogProduct[]): ShopCatalogProduct[] {
  return products
    .filter((product) => product.sku.trim().length > 0)
    .map((product) => ({
      erpProductId: product.id,
      sku: product.sku.trim(),
      name: product.name.trim(),
      category: product.category.trim(),
      priceCents: Math.round(product.price * 100),
      stock: Math.max(0, Math.trunc(product.stock)),
      minimumStock: Math.max(0, Math.trunc(product.minimumStock)),
      available: product.stock > 0,
      variations: product.variations?.trim() ?? "",
      updatedAt: product.updatedAt,
    }))
    .sort((first, second) => first.sku.localeCompare(second.sku, "pt-BR"));
}
