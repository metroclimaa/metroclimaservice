"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Experience = {
  presupuesto_id: string;
  numero: number;
  rubro: "climatizacion" | "electricidad";
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function ExperienceClient() {
  const [token, setToken] = useState("");
  const [experience, setExperience] = useState<Experience | null>(null);
  const [rating, setRating] = useState(5);
  const [state, setState] = useState<"loading" | "ready" | "sending" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentToken = params.get("token") ?? "";
    const budgetId = params.get("presupuesto") ?? "";
    const number = Number(params.get("numero") || 0);
    const category = params.get("rubro") === "electricidad" ? "electricidad" : "climatizacion";
    if (!uuidPattern.test(currentToken) || !uuidPattern.test(budgetId) || !number) {
      queueMicrotask(() => {
        setState("error");
        setMessage("Este enlace no es válido. Abrí el QR incluido en tu presupuesto de MetroClima.");
      });
      return;
    }

    queueMicrotask(() => {
      setToken(currentToken);
      setExperience({ presupuesto_id: budgetId, numero: number, rubro: category });
      setState("ready");
    });
  }, []);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!experience) return;
    setState("sending");
    const form = new FormData(event.currentTarget);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setState("error");
      setMessage("No pudimos conectar con el formulario. Intentá nuevamente en unos minutos.");
      return;
    }
    const { error } = await supabase.from("resenas_clientes").insert({
      presupuesto_id: experience.presupuesto_id,
      nombre_publico: String(form.get("nombre_publico") || "").trim() || "Cliente de MetroClima",
      puntuacion: rating,
      comentario: String(form.get("comentario") || "").trim(),
      review_token: token,
    });
    if (error) {
      setState("error");
      setMessage(error.code === "23505" ? "La experiencia de este trabajo ya fue enviada. Gracias por confiar en MetroClima." : "No pudimos guardar tu comentario. Revisá el texto e intentá nuevamente.");
      return;
    }
    setState("success");
  }

  return <main className="experience-page">
    <section className="experience-shell">
      <Link className="brand experience-brand" href="/">
        <span className="brand-mark"><img src="/metroclima-logo.png" alt="" /></span>
        <span className="brand-copy"><strong>METRO<span>CLIMA</span></strong><small>Climatización + Electricidad</small></span>
      </Link>

      <div className="experience-card">
        <div className="experience-mark"><span>✓</span><small>ENLACE PRIVADO</small></div>
        {state === "loading" && <div className="experience-loading"><span></span><p>Verificando tu presupuesto…</p></div>}

        {state === "success" && <div className="experience-success">
          <span>✓</span><h1>Gracias por elegirnos.</h1><p>Tu comentario llegó al equipo. Lo revisaremos antes de publicarlo para proteger tu privacidad.</p><Link className="button button-primary" href="/trabajos">Ver trabajos realizados</Link>
        </div>}

        {state === "error" && <div className="experience-error"><h1>No pudimos completar el envío.</h1><p>{message}</p><Link className="inline-link" href="/">Volver a MetroClima <span>→</span></Link></div>}

        {(state === "ready" || state === "sending") && experience && <>
          <p className="eyebrow"><span></span> Tu experiencia</p>
          <h1>¿Cómo quedó el trabajo?</h1>
          <p className="experience-lead">Tu opinión ayuda a otras personas a elegir con confianza y a nosotros a seguir mejorando.</p>
          <div className="experience-work"><span>{experience.rubro === "electricidad" ? "Electricidad" : "Climatización"}</span><div><small>Presupuesto PRE-{String(experience.numero).padStart(4, "0")}</small><strong>Trabajo realizado por MetroClima</strong></div></div>
          <form onSubmit={submitReview}>
            <fieldset>
              <legend>¿Cómo calificarías el trabajo?</legend>
              <div className="rating-picker">
                {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className={value <= rating ? "is-active" : ""} aria-label={`${value} estrella${value === 1 ? "" : "s"}`} aria-pressed={rating === value}>★</button>)}
              </div>
            </fieldset>
            <label><span>Nombre para mostrar</span><input name="nombre_publico" required minLength={2} maxLength={60} placeholder="Ej. Nicolás o Empresa de CABA" /><small>No publicamos correo, teléfono ni domicilio.</small></label>
            <label><span>Tu comentario</span><textarea name="comentario" required minLength={20} maxLength={1000} rows={5} placeholder="Contanos cómo fue la atención, el trabajo y el resultado final." /></label>
            <label className="review-consent"><input type="checkbox" required /><p>Autorizo a MetroClima a publicar este comentario junto con mi nombre visible y las fotos del trabajo, sin datos privados.</p></label>
            <button className="button button-primary" disabled={state === "sending"}>{state === "sending" ? "Enviando…" : "Enviar mi experiencia"} <span>→</span></button>
          </form>
        </>}
      </div>
      <p className="experience-privacy">El enlace es único para tu presupuesto. La reseña no se publica automáticamente: primero la revisan Cristian o Nicolás.</p>
    </section>
  </main>;
}
