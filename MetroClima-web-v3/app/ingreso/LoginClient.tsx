"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

export function LoginClient() {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setState("loading");
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    });
    if (error) {
      setState("error");
      return;
    }
    window.location.href = "/panel";
  }

  return (
    <main className="login-page">
      <div className="login-image" aria-hidden="true"></div>
      <section className="login-panel">
        <Link className="brand login-brand" href="/">
          <span className="brand-mark"><img src="/metroclima-logo.png" alt="" /></span>
          <span className="brand-copy"><strong>METRO<span>CLIMA</span></strong><small>Gestión interna</small></span>
        </Link>
        <div className="login-content">
          <p className="eyebrow"><span></span> Acceso protegido</p>
          <h1>Bienvenido de nuevo.</h1>
          <p>Ingresá para responder consultas, crear presupuestos y administrar la operación de MetroClima.</p>
          <form onSubmit={signIn}>
            <label><span>Correo electrónico</span><input name="email" type="email" required autoComplete="email" placeholder="nombre@metroclima.com.ar" /></label>
            <label><span>Contraseña</span><input name="password" type="password" required autoComplete="current-password" placeholder="••••••••••" /></label>
            <div className="login-options"><label><input type="checkbox" /> Mantener sesión</label><button type="button">Recuperar contraseña</button></div>
            <button className="button button-primary login-button" type="submit" disabled={!hasSupabaseConfig || state === "loading"}>{state === "loading" ? "Ingresando…" : "Ingresar al panel"} <span>→</span></button>
            {state === "error" && <p className="login-error">No pudimos validar esos datos.</p>}
          </form>
          {!hasSupabaseConfig && (
            <div className="demo-access">
              <span>Modo demostración</span>
              <p>El acceso real se habilita al conectar las dos cuentas de Supabase.</p>
              <Link href="/panel">Abrir panel de muestra →</Link>
            </div>
          )}
        </div>
        <div className="login-foot"><Link href="/">← Volver al sitio</Link><span>Sólo para personal autorizado</span></div>
      </section>
    </main>
  );
}
