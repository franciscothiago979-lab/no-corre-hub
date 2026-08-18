import { supabase } from "./supabase";

type StorageLike = Pick<Storage, "removeItem">;

export async function clearIndependentSession({ signOut = () => supabase.auth.signOut(), session = typeof window === "undefined" ? undefined : window.sessionStorage, local = typeof window === "undefined" ? undefined : window.localStorage }: { signOut?: () => Promise<unknown>; session?: StorageLike; local?: StorageLike } = {}) {
  await signOut();
  session?.removeItem("no-corre-auth-session");
  local?.removeItem("no-corre-auth-user");
}
