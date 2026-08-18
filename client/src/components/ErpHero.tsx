import React from "react";
import { useErpBranding } from "@/hooks/useErpBranding";

export function ErpHero({ path }: { path: string }) {
  const branding = useErpBranding();
  if (path !== "/dashboard") return null;
  const style = branding.heroImageUrl ? { backgroundImage: `linear-gradient(90deg, rgba(10,11,13,.94), rgba(10,11,13,.45)), url(${branding.heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined;
  return <section style={style} className="mb-7 overflow-hidden rounded-2xl bg-[#111315] p-6 text-white shadow-xl shadow-slate-200 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-300">No Corre Central</p><h1 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">{branding.heroTitle}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{branding.heroDescription}</p></section>;
}
