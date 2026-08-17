export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  shopSyncSecret: process.env.SHOP_ERP_SYNC_SECRET ?? "",
  shopSyncBaseUrl: process.env.SHOP_SYNC_BASE_URL?.replace(/\/$/, "") ?? "",
  shopSyncEnabled: process.env.SHOP_SYNC_ENABLED === "true",
  isProduction: process.env.NODE_ENV === "production",
};
