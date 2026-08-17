import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export const startLogin = async () => {
  if (!hasSupabaseConfig) {
    console.error("Supabase Auth não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.");
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
  if (error) console.error("Supabase Auth login failed:", error);
};
