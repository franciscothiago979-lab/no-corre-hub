export type AccessRole = "admin" | "user";

export const erpAdministrativePaths = [
  "/dashboard", "/clientes", "/produtos", "/fornecedores", "/precificacao", "/orcamentos", "/pedidos",
  "/producao", "/camisas", "/dtf", "/sublimacao", "/estoque", "/financeiro", "/relatorios",
  "/ia", "/biblioteca", "/marketing", "/configuracoes",
] as const;

export type ErpRouteAccess = "allowed" | "pending";

export function getErpRouteAccess(path: string, isAuthenticated: boolean, role?: AccessRole | null): ErpRouteAccess {
  const normalizedPath = path === "/" ? "/dashboard" : path;
  const isAdministrativeRoute = erpAdministrativePaths.includes(normalizedPath as (typeof erpAdministrativePaths)[number]);
  return isAdministrativeRoute && isAuthenticated && !canAccessErp(role) ? "pending" : "allowed";
}

export function canAccessErp(role?: AccessRole | null) {
  return role === "admin";
}

export function canChangeAdministratorRole(actorOpenId: string, ownerOpenId: string, targetOpenId: string, nextRole: AccessRole) {
  if (actorOpenId !== ownerOpenId) return false;
  if (targetOpenId === ownerOpenId && nextRole !== "admin") return false;
  return targetOpenId.trim().length > 0;
}
