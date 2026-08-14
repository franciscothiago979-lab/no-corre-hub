import React, { type ReactNode } from "react";
import { Shield } from "lucide-react";
import { getErpRouteAccess, type AccessRole } from "../../../shared/adminAccess";
import { Button } from "@/components/ui/button";

type AccessGateProps = {
  path: string;
  isAuthenticated: boolean;
  role?: AccessRole | null;
  onLogout: () => void;
  children: ReactNode;
};

export function AccessGate({ path, isAuthenticated, role, onLogout, children }: AccessGateProps) {
  if (getErpRouteAccess(path, isAuthenticated, role) !== "pending") return <>{children}</>;

  return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5"><div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><Shield className="h-7 w-7" /></div><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-amber-700">Acesso pendente</p><h1 className="mt-2 text-2xl font-extrabold text-slate-950">Sua conta aguarda aprovação</h1><p className="mt-3 text-sm leading-6 text-slate-600">Você já fez login, mas o proprietário do No Corre Hub ainda precisa autorizar seu perfil como administrador. Seus dados do ERP permanecem protegidos até essa aprovação.</p><Button className="mt-6" variant="ghost" onClick={onLogout}>Sair da conta</Button></div></div>;
}
