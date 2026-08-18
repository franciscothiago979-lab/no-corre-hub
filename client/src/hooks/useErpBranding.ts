import { useMemo } from "react";
import { normalizeErpBranding } from "../../../shared/erpBranding";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export function useErpBranding() {
  const { isAuthenticated, loading } = useAuth();
  const query = trpc.workspace.get.useQuery({ module: "company" }, { enabled: isAuthenticated && !loading, staleTime: 30_000 });
  return useMemo(() => {
    if (!query.data?.data) return normalizeErpBranding(undefined);
    try { return normalizeErpBranding(JSON.parse(query.data.data)); } catch { return normalizeErpBranding(undefined); }
  }, [query.data?.data]);
}
