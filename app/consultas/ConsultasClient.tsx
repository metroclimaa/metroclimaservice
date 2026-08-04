"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

type PublicQuestion = {
  id: string;
  categoria: string;
  titulo: string;
  consulta: string;
  nombre_publico: string;
  creado_en: string;
  respuesta?: string | null;
};

const seedQuestions: PublicQuestion[] = [
  {
    id: "demo-1",
    categoria: "Elección del equipo",
    titulo: "¿Qué potencia necesito para un living de 30 m²?",
    consulta: "El living tiene un ventanal grande y recibe sol durante la tarde. ¿Alcanza con un equipo de 3.000 frigorías?",
    nombre_publico: "Mariana",
    creado_en: "2026-08-02T15:00:00.000Z",
    respuesta: "Los metros cuadrados sirven como base, pero el ventanal y la orientación pueden aumentar la carga térmica. Para recomendarte bien conviene revisar altura, superficie vidriada y aislación.",
  },
  {
    id: "demo-2",
    categoria: "Tecnología inverter",
    titulo: "¿Conviene un inverter si lo uso muchas horas?",
    consulta: "Trabajo desde casa y en verano el equipo queda prendido casi todo el día.",
    nombre_publico: "Santiago",
    creado_en: "2026-07-30T11:30:00.000Z",
    respuesta: "Sí, es uno de los escenarios donde más sentido tiene. El compresor regula su potencia para mantener la temperatura y evita arrancar y detenerse constantemente.",
  },
  {
    id: "demo-3",
    categoria: "Mantenimiento",
    titulo: "El equipo enfría, pero pierde agua adentro",
    consulta: "Empezó a gotear por el frente después de varias semanas de uso. ¿Puede ser falta de gas?",
    nombre_publico: "Consulta anónima",
    creado_en: "2026-07-28T18:20:00.000Z",
    respuesta: "La pérdida de agua suele relacionarse con el drenaje o la suciedad de la bandeja, no necesariamente con falta de refrigerante. Conviene apagarlo y revisar antes de seguir usándolo.",
  },
  {
    id: "demo-4",
    categoria: "Instalación",
    titulo: "¿Se puede reutilizar la cañería de un equipo viejo?",
    consulta: "Voy a reemplazar un aire antiguo por uno nuevo y quisiera evitar romper la pared.",
    nombre_publico: "Federico",
    creado_en: "2026-07-24T09:10:00.000Z",
    respuesta: null,
  },
];

const categories = ["Todas", "Elección del equipo", "Instalación", "Mantenimiento", "Reparación", "Empresas"];

export function ConsultasClient() {
  const [questions, setQuestions] = useState<PublicQuestion[]>(seedQuestions);
  const [category, setCategory] = useState("Todas");
  const [search, setSearch] = useState("");
  const [wantsContact, setWantsContact] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("consultas_publicas")
      .select("id,categoria,titulo,consulta,nombre_publico,creado_en,respuesta")
      .order("creado_en", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setQuestions((data ?? []) as PublicQuestion[]);
      });
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    return questions.filter((item) => {
      const categoryMatches = category === "Todas" || item.categoria === category;
      const textMatches = !term || `${item.titulo} ${item.consulta} ${item.respuesta ?? ""}`.toLocaleLowerCase("es").includes(term);
      return categoryMatches && textMatches;
    });
  }, [category, questions, search]);

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const payload = {
      categoria: String(form.get("categoria") || "Consulta general"),
      titulo: String(form.get("titulo") || ""),
      consulta: String(form.get("consulta") || ""),
      nombre_publico: String(form.get("nombre_publico") || "").trim() || "Consulta anónima",
      acepta_contacto: wantsContact,
      email: wantsContact ? String(form.get("email") || "") || null : null,
      telefono: wantsContact ? String(form.get("telefono") || "") || null : null,
      localidad: wantsContact ? String(form.get("localidad") || "") || null : null,
    };

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { error } = await supabase.from("consultas").insert(payload);
      if (error) {
        setStatus("error");
        return;
      }
    }

    if (!supabase) {
      setStatus("error");
      return;
    }

    setStatus("success");
    event.currentTarget.reset();
    setWantsContact(true);
  }

  return (
    <main className="inner-page">
      <div className="inner-header-wrap"><SiteHeader active="consultas" /></div>

      <section className="page-hero forum-hero">
        <div className="shell page-hero-grid">
          <div>
            <p className="eyebrow light"><span></span> Comunidad MetroClima</p>
            <h1>Una buena decisión empieza con una buena pregunta.</h1>
          </div>
          <div>
            <p>Consultá sobre equipos, consumo, instalación o mantenimiento. Respondemos con criterio técnico y en un lenguaje claro.</p>
            <a className="button button-light" href="#nueva-consulta">Hacer una consulta</a>
          </div>
        </div>
      </section>

      <section className="forum-browser">
        <div className="shell">
          <div className="forum-toolbar">
            <label className="search-field">
              <span>⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar una pregunta o tema" />
            </label>
            <div className="category-tabs" role="tablist" aria-label="Categorías">
              {categories.map((item) => (
                <button key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)} type="button">{item}</button>
              ))}
            </div>
          </div>

          <div className="forum-list-heading">
            <h2>Consultas recientes</h2>
            <span>{filtered.length} conversaciones</span>
          </div>

          <div className="thread-list">
            {filtered.map((item) => (
              <article className="thread-card" key={item.id}>
                <div className="thread-author"><span>{item.nombre_publico.slice(0, 1).toUpperCase()}</span><small>{item.nombre_publico}<b>{new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(new Date(item.creado_en))}</b></small></div>
                <div className="thread-content">
                  <span className="category-pill">{item.categoria}</span>
                  <h3>{item.titulo}</h3>
                  <p>{item.consulta}</p>
                  {item.respuesta ? (
                    <div className="official-answer">
                      <div className="answer-brand"><img src="/metroclima-logo.png" alt="" /><span><strong>MetroClima</strong><small>Respuesta del equipo</small></span></div>
                      <p>{item.respuesta}</p>
                    </div>
                  ) : (
                    <div className="pending-answer"><span></span> Pendiente de respuesta</div>
                  )}
                </div>
              </article>
            ))}
            {!filtered.length && <div className="empty-state"><h3>No encontramos consultas</h3><p>Probá con otra palabra o elegí una categoría diferente.</p></div>}
          </div>
        </div>
      </section>

      <section className="new-question-section" id="nueva-consulta">
        <div className="shell new-question-grid">
          <div className="form-intro">
            <p className="eyebrow"><span></span> Nueva consulta</p>
            <h2>Contanos qué necesitás.</h2>
            <p>Podés hacer una pregunta general o dejar información para que coordinemos un presupuesto.</p>
            <div className="privacy-card">
              <span>✓</span>
              <div><strong>Tus datos de contacto son privados</strong><p>Teléfono, correo y localidad nunca se publican en el foro. Sólo pueden verlos Cristian y Nicolás desde el panel protegido.</p></div>
            </div>
          </div>

          <form className="question-form" onSubmit={submitQuestion}>
            <div className="form-row two">
              <label><span>Tu nombre o alias</span><input name="nombre_publico" placeholder="Ej. Nicolás o Consulta anónima" /></label>
              <label><span>Categoría</span><select name="categoria" required defaultValue=""><option value="" disabled>Seleccionar</option>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
            <label><span>Título de la consulta</span><input name="titulo" required minLength={8} placeholder="Resumí tu duda en una línea" /></label>
            <label><span>¿Qué necesitás saber?</span><textarea name="consulta" required minLength={20} rows={5} placeholder="Contanos sobre el ambiente, el equipo o el problema. Cuanto más detalle, mejor podremos orientarte." /></label>
            <label className="contact-toggle"><input type="checkbox" checked={wantsContact} onChange={(event) => setWantsContact(event.target.checked)} /><span></span><div><strong>Quiero que MetroClima me contacte</strong><small>Estos datos quedarán fuera de la publicación.</small></div></label>
            {wantsContact && (
              <div className="private-fields">
                <div className="private-label"><span>Privado</span> Información visible sólo para MetroClima</div>
                <div className="form-row two">
                  <label><span>Teléfono / WhatsApp</span><input name="telefono" type="tel" placeholder="11 0000 0000" /></label>
                  <label><span>Correo electrónico</span><input name="email" type="email" placeholder="nombre@correo.com" /></label>
                </div>
                <label><span>Localidad o barrio</span><input name="localidad" placeholder="Ej. Avellaneda, CABA, Quilmes" /></label>
              </div>
            )}
            <div className="form-submit-row">
              <p>Al enviar aceptás que publiquemos la pregunta sin mostrar tus datos privados.</p>
              <button className="button button-primary" type="submit" disabled={status === "sending"}>{status === "sending" ? "Enviando…" : "Enviar consulta"} <span>→</span></button>
            </div>
            <div className={`form-status ${status}`} aria-live="polite">
              {status === "success" && "¡Consulta enviada! La vamos a revisar desde el panel."}
              {status === "error" && (hasSupabaseConfig ? "No pudimos guardar la consulta. Revisá los datos y probá nuevamente." : "El canal de consultas está terminando de configurarse. Podés escribirnos por WhatsApp.")}
            </div>
          </form>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
