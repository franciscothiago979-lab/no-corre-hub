import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerShopIntegrationRoutes } from "../shopIntegration";
function validCron(req: express.Request) {
  const secret = process.env.EXTERNAL_CRON_SECRET;
  const supplied = req.header("x-external-cron-secret") || req.header("authorization")?.replace(/^Bearer\s+/i, "");
  return Boolean(secret && supplied === secret);
}

export async function createApp() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/health", (_req, res) => res.json({ ok: true, service: "no-corre-central", runtime: "external" }));
  app.get("/api/cron/health", (req, res) => res.status(validCron(req) ? 200 : 401).json({ ok: validCron(req) }));
  registerShopIntegrationRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  return app;
}

async function startServer() {
  const app = await createApp();
  const server = createServer(app);
  if (process.env.NODE_ENV === "development") await setupVite(app, server);
  else serveStatic(app);
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  server.listen(port, "0.0.0.0", () => console.log(`Server running on port ${port}.`));
}

const isTestRuntime = process.env.NODE_ENV === "test" || process.env.VITEST === "true" || process.argv.some((argument) => argument.includes("vitest"));
if (!isTestRuntime) startServer().catch(console.error);
