import type { Request } from "express";
import type { User } from "../drizzle/schema";

export async function authenticateIndependentRequest(req: Request): Promise<User | null> {
  const token = req.header("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
  if (!token || !url || !key) return null;

  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
  if (!response.ok) return null;
  const remote = await response.json() as { id?: string; email?: string; user_metadata?: { full_name?: string; name?: string } };
  if (!remote.id || !remote.email) return null;

  const email = remote.email.trim().toLowerCase();
  const ownerEmail = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
  const now = new Date();
  return {
    id: 0,
    openId: `supabase:${remote.id}`,
    name: remote.user_metadata?.full_name || remote.user_metadata?.name || email,
    email,
    loginMethod: "supabase",
    role: ownerEmail && email === ownerEmail ? "admin" : "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}
