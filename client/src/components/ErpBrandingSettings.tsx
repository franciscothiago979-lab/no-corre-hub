import { useEffect, useState } from "react";
import { Image, Save } from "lucide-react";
import { defaultErpBranding, normalizeErpBranding, type ErpBranding } from "../../../shared/erpBranding";
import { trpc } from "@/lib/trpc";

export function ErpBrandingSettings() {
  const utils = trpc.useUtils();
  const settings = trpc.workspace.get.useQuery({ module: "company" });
  const [draft, setDraft] = useState<ErpBranding>(defaultErpBranding);
  useEffect(() => {
    if (!settings.data?.data) return;
    try { setDraft(normalizeErpBranding(JSON.parse(settings.data.data))); } catch { setDraft(defaultErpBranding); }
  }, [settings.data?.data]);
  const save = trpc.workspace.save.useMutation({
    onSuccess: async () => { await utils.workspace.get.invalidate({ module: "company" }); },
  });
  return <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#b7dfe3]/70">
    <div className="flex items-start gap-3"><span className="rounded-xl bg-orange-50 p-3 text-orange-600"><Image className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[.14em] text-orange-600">Aparência do ERP</p><h2 className="mt-1 font-extrabold text-slate-950">Hero e logotipo</h2><p className="mt-1 text-sm text-slate-500">Troque os textos, a imagem principal do Dashboard e o logotipo exibido no menu superior esquerdo.</p></div></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2"><label className="grid gap-1.5 text-sm font-bold text-slate-700">Título do hero<input value={draft.heroTitle} onChange={(event) => setDraft({ ...draft, heroTitle: event.target.value })} className="rounded-xl bg-slate-50 px-3 py-2.5 font-normal outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500" /></label><label className="grid gap-1.5 text-sm font-bold text-slate-700">Descrição do hero<input value={draft.heroDescription} onChange={(event) => setDraft({ ...draft, heroDescription: event.target.value })} className="rounded-xl bg-slate-50 px-3 py-2.5 font-normal outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500" /></label><label className="grid gap-1.5 text-sm font-bold text-slate-700">URL da imagem do hero<input type="url" value={draft.heroImageUrl} onChange={(event) => setDraft({ ...draft, heroImageUrl: event.target.value })} placeholder="https://.../hero.jpg" className="rounded-xl bg-slate-50 px-3 py-2.5 font-normal outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500" /></label><label className="grid gap-1.5 text-sm font-bold text-slate-700">URL do logotipo<input type="url" value={draft.logoUrl} onChange={(event) => setDraft({ ...draft, logoUrl: event.target.value })} placeholder="https://.../logo.png" className="rounded-xl bg-slate-50 px-3 py-2.5 font-normal outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500" /></label></div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-3">{draft.logoUrl ? <img src={draft.logoUrl} alt="Prévia do logotipo" className="h-10 w-20 rounded-lg bg-slate-950 object-contain p-1" /> : null}<span className="text-xs text-slate-500">Use links HTTPS de imagens públicas. A prévia é aplicada após salvar.</span></div><button type="button" onClick={() => save.mutate({ module: "company", data: JSON.stringify(normalizeErpBranding(draft)) })} disabled={save.isPending} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-[#111315] hover:bg-orange-400 disabled:opacity-60"><Save className="h-4 w-4" />{save.isPending ? "Salvando..." : "Salvar aparência"}</button></div>
  </section>;
}
