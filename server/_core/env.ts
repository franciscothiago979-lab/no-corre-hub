export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  shopSyncSecret: process.env.SHOP_ERP_SYNC_SECRET ?? "",
  shopSyncBaseUrl: process.env.SHOP_SYNC_BASE_URL?.replace(/\/$/, "") ?? "",
  shopSyncEnabled: process.env.SHOP_SYNC_ENABLED === "true",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
