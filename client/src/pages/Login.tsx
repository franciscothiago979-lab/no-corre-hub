import { Link } from "wouter";
import { FormEvent, useState } from "react";
import { ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    if (!hasSupabaseConfig) {
      setStatus("error");
      setMessage("O acesso seguro ainda está sendo configurado. Atualize a página em alguns instantes.");
      return;
    }

    setStatus("sending");
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      setStatus("error");
      setMessage("Não foi possível enviar o link agora. Confira o e-mail e tente novamente.");
      return;
    }

    setStatus("sent");
    setMessage("Enviamos um link seguro para este e-mail. Abra-o neste dispositivo para entrar no ERP.");
  }

  return (
    <main className="min-h-screen bg-[#11110f] px-5 py-8 text-[#fcfbf7] sm:px-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <Link href="/" className="mb-10 inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#e5ff83] hover:text-white">
          <ArrowLeft size={15} /> Voltar ao ERP
        </Link>
        <section className="rounded-[1.75rem] border border-white/15 bg-[#1a1a17] p-7 shadow-2xl sm:p-9">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e5ff83] text-black"><ShieldCheck size={23} /></span>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[.18em] text-[#e5ff83]">No Corre Central</p>
          <h1 className="mt-3 font-display text-4xl tracking-[-.06em] sm:text-5xl">Entre com seu e-mail.</h1>
          <p className="mt-4 text-sm leading-6 text-white/65">Você receberá um link único e seguro para acessar os dados operacionais do ERP.</p>

          <form className="mt-8 grid gap-4" onSubmit={submit}>
            <label className="grid gap-2 text-sm font-semibold" htmlFor="login-email">
              E-mail autorizado
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
                className="h-12 rounded-xl border border-white/20 bg-black/20 px-4 text-white outline-none placeholder:text-white/35 focus:border-[#e5ff83] focus:ring-2 focus:ring-[#e5ff83]/25"
              />
            </label>
            <button className="button-primary mt-1 min-h-12 justify-center" disabled={status === "sending"} type="submit">
              <MailCheck size={17} /> {status === "sending" ? "Enviando link..." : "Enviar link de acesso"}
            </button>
          </form>

          {message ? <p className={`mt-5 rounded-xl px-4 py-3 text-sm leading-6 ${status === "sent" ? "bg-[#e5ff83] text-black" : "bg-red-950/60 text-red-100"}`} role="status">{message}</p> : null}
        </section>
      </div>
    </main>
  );
}
