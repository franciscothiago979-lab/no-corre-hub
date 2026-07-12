import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "NO CORRE HUB", description: "Gestão da NO CORRE SPORT & STREETWEAR" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
