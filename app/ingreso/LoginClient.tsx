"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

type Mode = "login" | "activate" | "recover" | "new-password";

export function LoginClient() {
  const [mode, setMode] = useState<Mode>("login");
  const [state, setState] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("new-password");
        setState("idle");
        setMessage("");
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function ensureAdmin() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;
    const { data, error } = await supabase
      .from("perfiles")
      .select("id,nombre,activo")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (error || !data?.activo) {
      await supabase.auth.signOut();
      return false;
    }
    return true;
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setState("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") || "").trim().toLowerCase(),
      password: String(form.get("password") || ""),
    });
    if (error || !(await ensureAdmin())) {
      setState("error");
      setMessage(error ? "El correo o la contraseña no son correctos." : "Esta cuenta no está autorizada para administrar MetroClima.");
      return;
    }
    window.location.replace("/panel");
  }

  async function activateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setState("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirm_password") || "");
    if (password.length < 10 || password !== confirmPassword) {
      setState("error");
      setMessage(password.length < 10 ? "La contraseña debe tener al menos 10 caracteres." : "Las contraseñas no coinciden.");
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email") || "").trim().toLowerCase(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/ingreso` },
    });
    if (error) {
      setState("error");
      setMessage("No pudimos activar la cuenta. Verificá que el correo esté autorizado.");
      return;
    }
    setState("success");
    setMessage("Te enviamos un correo para confirmar la cuenta. Después vas a poder ingresar al panel.");
  }

  async function recoverPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setState("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.auth.resetPasswordForEmail(
      String(form.get("email") || "").trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/ingreso` },
    );
    if (error) {
      setState("error");
      setMessage("No pudimos enviar el enlace. Probá nuevamente en unos minutos.");
      return;
    }
    setState("success");
    setMessage("Si la cuenta existe, vas a recibir un enlace para crear una contraseña nueva.");
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setState("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (password.length < 10 || password !== String(form.get("confirm_password") || "")) {
      setState("error");
      setMessage(password.length < 10 ? "La contraseña debe tener al menos 10 caracteres." : "Las contraseñas no coinciden.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setState("error");
      setMessage("No pudimos actualizar la contraseña. Volvé a solicitar el enlace.");
      return;
    }
    setState("success");
    setMessage("Contraseña actualizada. Ya podés ingresar.");
    setMode("login");
  }

  const copy = {
    login: { eyebrow: "Acceso protegido", title: "Bienvenido de nuevo.", text: "Ingresá para responder consultas, crear presupuestos y administrar MetroClima." },
    activate: { eyebrow: "Primera vez", title: "Activá tu cuenta.", text: "Usá únicamente el correo previamente autorizado para Cristian o Nicolás." },
    recover: { eyebrow: "Recuperar acceso", title: "Restablecé tu contraseña.", text: "Te enviaremos un enlace seguro al correo de tu cuenta." },
    "new-password": { eyebrow: "Nueva contraseña", title: "Protegé tu cuenta.", text: "Elegí una contraseña de al menos 10 caracteres." },
  }[mode];

  return (
    <main className="login-page">
      <div className="login-image" aria-hidden="true"></div>
      <section className="login-panel">
        <Link className="brand login-brand" href="/">
          <span className="brand-mark"><img src="/metroclima-logo.png" alt="" /></span>
          <span className="brand-copy"><strong>METRO<span>CLIMA</span></strong><small>Gestión interna</small></span>
        </Link>
        <div className="login-content">
          <p className="eyebrow"><span></span> {copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.text}</p>

          {mode === "login" && <form onSubmit={signIn}>
            <label><span>Correo electrónico</span><input name="email" type="email" required autoComplete="email" /></label>
            <label><span>Contraseña</span><input name="password" type="password" required autoComplete="current-password" /></label>
            <div className="login-options"><button type="button" onClick={() => { setMode("activate"); setState("idle"); setMessage(""); }}>Activar cuenta</button><button type="button" onClick={() => { setMode("recover"); setState("idle"); setMessage(""); }}>Recuperar contraseña</button></div>
            <button className="button button-primary login-button" type="submit" disabled={!hasSupabaseConfig || state === "loading"}>{state === "loading" ? "Ingresando…" : "Ingresar al panel"} <span>→</span></button>
          </form>}

          {mode === "activate" && <form onSubmit={activateAccount}>
            <label><span>Correo autorizado</span><input name="email" type="email" required autoComplete="email" /></label>
            <label><span>Contraseña</span><input name="password" type="password" minLength={10} required autoComplete="new-password" /></label>
            <label><span>Repetir contraseña</span><input name="confirm_password" type="password" minLength={10} required autoComplete="new-password" /></label>
            <button className="button button-primary login-button" type="submit" disabled={!hasSupabaseConfig || state === "loading"}>{state === "loading" ? "Activando…" : "Activar mi cuenta"} <span>→</span></button>
          </form>}

          {mode === "recover" && <form onSubmit={recoverPassword}>
            <label><span>Correo de la cuenta</span><input name="email" type="email" required autoComplete="email" /></label>
            <button className="button button-primary login-button" type="submit" disabled={!hasSupabaseConfig || state === "loading"}>{state === "loading" ? "Enviando…" : "Enviar enlace seguro"} <span>→</span></button>
          </form>}

          {mode === "new-password" && <form onSubmit={updatePassword}>
            <label><span>Nueva contraseña</span><input name="password" type="password" minLength={10} required autoComplete="new-password" /></label>
            <label><span>Repetir contraseña</span><input name="confirm_password" type="password" minLength={10} required autoComplete="new-password" /></label>
            <button className="button button-primary login-button" type="submit" disabled={!hasSupabaseConfig || state === "loading"}>{state === "loading" ? "Guardando…" : "Guardar contraseña"} <span>→</span></button>
          </form>}

          {message && <p className={`login-feedback ${state}`} role="status">{message}</p>}
          {mode !== "login" && mode !== "new-password" && <button className="login-back-button" type="button" onClick={() => { setMode("login"); setState("idle"); setMessage(""); }}>← Volver al ingreso</button>}
          {!hasSupabaseConfig && <div className="demo-access"><span>Configuración pendiente</span><p>El acceso se habilitará cuando termine la conexión segura con Supabase.</p></div>}
        </div>
        <div className="login-foot"><Link href="/">← Volver al sitio</Link><span>Sólo para personal autorizado</span></div>
      </section>
    </main>
  );
}
