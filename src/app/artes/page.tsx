"use client";

import { AppShell } from "@/components/app-shell";
import { ImagePlus, RotateCcw, Upload } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";

type ShirtSize = "PP" | "P" | "M" | "G" | "GG" | "XG";
type PositionKey = "peito_esquerdo" | "peito_direito" | "frente_pequena" | "frente_central" | "frente_grande" | "nuca_costas" | "costas_central" | "costas_grande" | "manga_esquerda" | "manga_direita";
type Range = [number, number];

const sizes: ShirtSize[] = ["PP", "P", "M", "G", "GG", "XG"];
const ranges: Record<PositionKey, Record<ShirtSize, Range>> = {
 peito_esquerdo: {PP:[7,9],P:[8,10],M:[8,10],G:[9,11],GG:[9,11],XG:[10,12]},
 peito_direito: {PP:[7,9],P:[8,10],M:[8,10],G:[9,11],GG:[9,11],XG:[10,12]},
 frente_pequena: {PP:[14,17],P:[16,19],M:[18,21],G:[20,23],GG:[22,25],XG:[24,27]},
 frente_central: {PP:[18,22],P:[20,24],M:[22,26],G:[24,28],GG:[26,30],XG:[28,32]},
 frente_grande: {PP:[22,25],P:[24,27],M:[26,29],G:[28,31],GG:[30,33],XG:[32,35]},
 nuca_costas: {PP:[6,8],P:[6,8],M:[7,9],G:[7,9],GG:[8,10],XG:[8,10]},
 costas_central: {PP:[20,24],P:[22,26],M:[24,28],G:[26,30],GG:[28,32],XG:[30,34]},
 costas_grande: {PP:[24,27],P:[26,29],M:[28,31],G:[30,33],GG:[32,35],XG:[34,37]},
 manga_esquerda: {PP:[6,8],P:[7,9],M:[7,9],G:[8,10],GG:[8,10],XG:[9,11]},
 manga_direita: {PP:[6,8],P:[7,9],M:[7,9],G:[8,10],GG:[8,10],XG:[9,11]}
};
const positions: Record<PositionKey, {label:string; description:string; placement:string; back?:boolean}> = {
 peito_esquerdo:{label:"Peito esquerdo",description:"Logo, escudo ou frase minimalista.",placement:"left-[19%] top-[22%]"},
 peito_direito:{label:"Peito direito",description:"Logo, nome ou arte complementar.",placement:"right-[19%] top-[22%]"},
 frente_pequena:{label:"Frente central pequena",description:"Frase curta ou símbolo central.",placement:"left-1/2 top-[27%] -translate-x-1/2"},
 frente_central:{label:"Frente central",description:"Estampa principal de tamanho médio.",placement:"left-1/2 top-[30%] -translate-x-1/2"},
 frente_grande:{label:"Frente grande",description:"Arte de destaque ou streetwear.",placement:"left-1/2 top-[28%] -translate-x-1/2"},
 nuca_costas:{label:"Nuca das costas",description:"Assinatura, logo pequeno ou marca.",placement:"left-1/2 top-[13%] -translate-x-1/2",back:true},
 costas_central:{label:"Costas central",description:"Estampa principal nas costas.",placement:"left-1/2 top-[27%] -translate-x-1/2",back:true},
 costas_grande:{label:"Costas grande",description:"Arte grande de destaque nas costas.",placement:"left-1/2 top-[24%] -translate-x-1/2",back:true},
 manga_esquerda:{label:"Manga esquerda",description:"Logo vertical, detalhe ou frase curta.",placement:"-left-[22%] top-[29%]"},
 manga_direita:{label:"Manga direita",description:"Logo vertical, detalhe ou frase curta.",placement:"-right-[22%] top-[29%]"}
};
function formatRange(range:Range){return range[0]+"–"+range[1]+" cm";}
const chestOffset: Record<ShirtSize,number>={PP:7,P:8,M:9,G:10,GG:11,XG:12};
const chestDown: Record<ShirtSize,number>={PP:8,P:8,M:8,G:9,GG:9,XG:10};
const centerDown: Record<ShirtSize,number>={PP:7,P:7,M:8,G:8,GG:9,XG:9};
const backDown: Record<ShirtSize,number>={PP:8,P:8,M:9,G:9,GG:10,XG:10};
const sleeveDown: Record<ShirtSize,number>={PP:5,P:5,M:6,G:6,GG:7,XG:7};

export default function Artes(){
 const [image,setImage]=useState<string>(); const [size,setSize]=useState<ShirtSize>("M"); const [position,setPosition]=useState<PositionKey>("peito_esquerdo"); const [width,setWidth]=useState(9);
 const current=positions[position]; const range=ranges[position][size]; const isGood=width>=range[0]&&width<=range[1];
 const previewWidth=useMemo(()=>Math.min((width/40)*100,85),[width]);
 const pressGuide=useMemo(()=>{
  if(position==="peito_esquerdo"||position==="peito_direito"){const side=position==="peito_esquerdo"?"esquerdo":"direito";return {horizontal:"Da linha central, meça "+chestOffset[size]+" cm para o lado "+side+" de quem veste.",vertical:"Da base da gola, meça "+chestDown[size]+" cm para baixo.",extra:"Posicione o centro da arte no cruzamento das duas marcações."};}
  if(position==="manga_esquerda"||position==="manga_direita"){return {horizontal:"Centralize a arte na largura da manga.",vertical:"Da costura do ombro, meça "+sleeveDown[size]+" cm para baixo.",extra:"Use fita térmica e mantenha a arte paralela à costura da manga."};}
  if(position==="nuca_costas"){const down=size==="PP"||size==="P"?3:size==="M"||size==="G"?4:5;return {horizontal:"Dobre a camiseta ao meio para marcar a linha central das costas.",vertical:"Da base da gola das costas, meça "+down+" cm para baixo.",extra:"Centralize a arte pequena sobre a linha central."};}
  if(position==="costas_central"||position==="costas_grande"){const down=position==="costas_grande"?Math.max(backDown[size]-1,7):backDown[size];return {horizontal:"Dobre a camiseta ao meio para marcar a linha central das costas.",vertical:"Da base da gola das costas, meça "+down+" cm para baixo.",extra:"Centralize a borda superior da arte nesta linha."};}
  const down=position==="frente_grande"?Math.max(centerDown[size]-1,6):centerDown[size];return {horizontal:"Dobre a camiseta ao meio para marcar a linha central da frente.",vertical:"Da base da gola, meça "+down+" cm para baixo.",extra:"Centralize a borda superior da arte nesta linha."};
 },[position,size]);
 const ruler=useMemo(()=>{
  const cm=6; const centerX=165; const collarY=42;
  if(position==="manga_esquerda"||position==="manga_direita"){const left=position==="manga_esquerda";const shoulderX=left?54:276;const targetY=100+sleeveDown[size]*cm;return {originX:shoulderX,originY:100,targetX:left?38:292,targetY,hLabel:"centro da manga",vLabel:sleeveDown[size]+" cm"};}
  if(position==="peito_esquerdo"||position==="peito_direito"){const left=position==="peito_esquerdo";const targetX=centerX+(left?-1:1)*chestOffset[size]*cm;const targetY=collarY+chestDown[size]*cm;return {originX:centerX,originY:collarY,targetX,targetY,hLabel:chestOffset[size]+" cm",vLabel:chestDown[size]+" cm"};}
  const down=position==="nuca_costas"?(size==="PP"||size==="P"?3:size==="M"||size==="G"?4:5):position==="costas_central"?backDown[size]:position==="costas_grande"?Math.max(backDown[size]-1,7):position==="frente_grande"?Math.max(centerDown[size]-1,6):centerDown[size];return {originX:centerX,originY:collarY,targetX:centerX,targetY:collarY+down*cm,hLabel:"linha central",vLabel:down+" cm"};
 },[position,size]);
 function load(e:ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(f)setImage(URL.createObjectURL(f));}
 function changePosition(value:PositionKey){const next=ranges[value][size];setPosition(value);setWidth(Math.round((next[0]+next[1])/2));}
 function changeSize(value:ShirtSize){const next=ranges[position][value];setSize(value);setWidth(Math.round((next[0]+next[1])/2));}
 return <AppShell title="Artes e simulador">
  <div className="mb-6 rounded-2xl border border-lime bg-lime/25 p-4 text-sm"><b>Biblioteca identificada:</b> G:\ARQUIVOS GRAFICA. Envie uma arte para testar visualmente; o envio é local e não altera os arquivos do HD.</div>
  <div className="grid gap-6 xl:grid-cols-[1fr_430px]">
   <section className="card"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="label">Provador de arte DTF</p><h2 className="text-xl font-black">Simulação de posição e tamanho</h2></div><label className="action flex cursor-pointer items-center gap-2"><Upload size={17}/>Enviar arte<input accept="image/png,image/jpeg,image/webp" onChange={load} className="hidden" type="file"/></label></div>
    <div className="mx-auto mt-6 flex min-h-[530px] max-w-[440px] items-center justify-center overflow-hidden rounded-2xl bg-neutral-200 p-5"><div className="relative h-[470px] w-[330px] rounded-t-[72px] bg-neutral-900 shadow-xl before:absolute before:-left-12 before:top-16 before:h-48 before:w-20 before:rounded-tl-[35px] before:bg-neutral-900 after:absolute after:-right-12 after:top-16 after:h-48 after:w-20 after:rounded-tr-[35px] after:bg-neutral-900"><div className="absolute left-1/2 top-0 h-10 w-24 -translate-x-1/2 rounded-b-[45px] bg-neutral-200"/><svg aria-label="Régua visual de posicionamento" className="pointer-events-none absolute inset-0 z-20 overflow-visible" viewBox="0 0 330 470"><line x1="165" y1="42" x2="165" y2="420" stroke="#c6ff00" strokeWidth="1" strokeDasharray="4 4" opacity=".75"/><line x1={ruler.originX} y1={ruler.originY} x2={ruler.originX} y2={ruler.targetY} stroke="#c6ff00" strokeWidth="2"/><line x1={ruler.originX} y1={ruler.targetY} x2={ruler.targetX} y2={ruler.targetY} stroke="#c6ff00" strokeWidth="2"/><circle cx={ruler.targetX} cy={ruler.targetY} r="4" fill="#c6ff00"/><text x={ruler.originX+5} y={(ruler.originY+ruler.targetY)/2} fill="#c6ff00" fontSize="11" fontWeight="700">{ruler.vLabel}</text><text x={(ruler.originX+ruler.targetX)/2} y={ruler.targetY-6} fill="#c6ff00" fontSize="11" fontWeight="700" textAnchor="middle">{ruler.hLabel}</text><text x="169" y="32" fill="#c6ff00" fontSize="9">CENTRO</text></svg><span className="absolute bottom-7 left-1/2 z-30 -translate-x-1/2 text-xs font-bold text-white/35">{current.back?"VERSO • NO CORRE":"NO CORRE"}</span><div className={"absolute z-10 "+current.placement} style={{width:previewWidth+"%",maxWidth:position.includes("manga")?"76px":"275px"}}>{image?<img className="max-h-64 w-full object-contain" src={image} alt="Arte selecionada"/>:<div className="flex aspect-square w-full items-center justify-center rounded border-2 border-dashed border-lime bg-white/10 text-center text-xs font-bold text-lime"><ImagePlus size={22}/><span className="ml-1">SUA<br/>ARTE</span></div>}</div></div></div>
    <p className="mt-3 text-center text-xs text-black/55"><span className="font-bold text-black">Linha pontilhada:</span> centro da peça. <span className="font-bold text-black">Linhas verdes:</span> régua de marcação em centímetros.</p>
   </section>
   <aside className="card"><p className="label">Configuração</p><h2 className="text-xl font-black">Medidas da aplicação</h2><label className="mt-5 block text-sm font-bold">Tamanho da camiseta<select className="field" value={size} onChange={e=>changeSize(e.target.value as ShirtSize)}>{sizes.map(x=><option key={x}>{x}</option>)}</select></label><label className="mt-4 block text-sm font-bold">Posição da arte<select className="field" value={position} onChange={e=>changePosition(e.target.value as PositionKey)}>{Object.entries(positions).map(([key,item])=><option value={key} key={key}>{item.label}</option>)}</select></label><p className="mt-2 text-xs text-black/55">{current.description}</p><label className="mt-4 block text-sm font-bold">Largura da arte: {width} cm<input className="mt-3 w-full accent-black" type="range" min="5" max="40" value={width} onChange={e=>setWidth(Number(e.target.value))}/></label><button onClick={()=>setWidth(Math.round((range[0]+range[1])/2))} className="ghost mt-3 flex w-full items-center justify-center gap-2"><RotateCcw size={15}/>Usar medida média recomendada</button><div className={"mt-5 rounded-xl p-4 "+(isGood?"bg-lime/35":"bg-orange-100")}><p className="font-black">{isGood?"Tamanho adequado":"Atenção: ajuste recomendado"}</p><p className="mt-1 text-sm">{current.label} para camiseta {size}: use {formatRange(range)}. A arte atual tem {width} cm.</p></div><div className="mt-4 rounded-xl border-2 border-dashed border-black/20 bg-black/[.025] p-4"><p className="label !text-black">Marcação para prensagem</p><p className="mt-2 text-sm font-bold">{current.label} • Camiseta {size}</p><p className="mt-2 text-sm"><b>1. Horizontal:</b> {pressGuide.horizontal}</p><p className="mt-2 text-sm"><b>2. Vertical:</b> {pressGuide.vertical}</p><p className="mt-2 text-sm"><b>3. Aplicação:</b> {pressGuide.extra}</p></div><a href="/guia-artes" className="ghost mt-4 block text-center">Ver tabela completa por posição e tamanho</a></aside>
  </div>
 </AppShell>
}
