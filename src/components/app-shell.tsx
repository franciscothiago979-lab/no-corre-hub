"use client";
import { Menu, Bell } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./sidebar";
export function AppShell({ title, children }: { title: string; children: React.ReactNode }) { const [open,setOpen]=useState(false); return <div className="flex min-h-screen"><Sidebar open={open} close={()=>setOpen(false)}/><main className="min-w-0 flex-1"><header className="flex h-20 items-center justify-between border-b border-black/10 bg-stone px-5 md:px-8"><div className="flex items-center gap-3"><button className="lg:hidden" onClick={()=>setOpen(true)}><Menu/></button><div><h1 className="text-xl font-black">{title}</h1><p className="hidden text-xs text-black/55 sm:block">NO CORRE SPORT & STREETWEAR</p></div></div><div className="flex items-center gap-3"><Bell size={19}/><div className="rounded-full bg-ink px-3 py-2 text-xs font-bold text-lime">ADMIN</div></div></header><div className="mx-auto max-w-7xl p-5 md:p-8">{children}</div></main></div>; }
