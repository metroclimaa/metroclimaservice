"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type WorkRow = {
  id: string;
  titulo_publico: string;
  resumen: string;
  localidad_publica: string | null;
  fecha_realizacion: string | null;
  publicado: boolean;
  presupuestos: { numero: number; clientes: { nombre_razon_social: string } | null } | null;
};

export function WorkQuickEditor() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [works, setWorks] = useState<WorkRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const selected = works.find((work) => work.id === selectedId);

  async function load() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase
      .from("trabajos")
      .select("id,titulo_publico,resumen,localidad_publica,fecha_realizacion,publicado,presupuestos(numero,clientes(nombre_razon_social))")
      .order("creado_en", { ascending: false });
    setWorks((data ?? []) as unknown as WorkRow[]);
  }

  useEffect(() => {
    if (pathname === "/panel") void load();
  }, [pathname]);

  if (pathname !== "/panel") return null;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("");
    const { error } = await getSupabaseBrowserClient()!.from("trabajos").update({
      titulo_publico: String(form.get("titulo") || "").trim(),
      resumen: String(form.get("resumen") || "").trim(),
      localidad_publica: String(form.get("localidad") || "").trim() || null,
      fecha_realizacion: String(form.get("fecha") || "") || null,
    }).eq("id", selected.id);
    setSaving(false);
    if (error) {
      setMessage("No pudimos guardar los cambios.");
      return;
    }
    setMessage("✓ Trabajo actualizado correctamente.");
    await load();
  }

  return <>
    <button className="work-quick-editor-trigger" onClick={() => setOpen(true)} aria-label="Editar trabajos">✎ <span>Editar trabajos</span></button>
    {open && <div className="work-quick-editor-backdrop" onClick={() => setOpen(false)}>
      <section className="work-quick-editor" onClick={(event) => event.stopPropagation()}>
        <header><div><small>CORRECCIÓN RÁPIDA</small><h2>Editar trabajo</h2><p>Corregí los datos aunque el trabajo ya esté guardado o publicado.</p></div><button onClick={() => setOpen(false)} aria-label="Cerrar">×</button></header>
        <label><span>Trabajo</span><select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setMessage(""); }}><option value="">Seleccionar trabajo</option>{works.map((work) => <option key={work.id} value={work.id}>PRE-{String(work.presupuestos?.numero ?? 0).padStart(4,"0")} · {work.presupuestos?.clientes?.nombre_razon_social || "Cliente"} · {work.titulo_publico}</option>)}</select></label>
        {selected && <form key={selected.id} onSubmit={save}>
          <label><span>Título público</span><input name="titulo" defaultValue={selected.titulo_publico} required minLength={6} maxLength={140} /></label>
          <label><span>Descripción / resumen</span><textarea name="resumen" defaultValue={selected.resumen} required minLength={20} maxLength={1200} rows={6} /></label>
          <div className="work-quick-editor-row"><label><span>Localidad</span><input name="localidad" defaultValue={selected.localidad_publica ?? ""} maxLength={100} /></label><label><span>Fecha</span><input name="fecha" type="date" defaultValue={selected.fecha_realizacion ?? ""} /></label></div>
          <div className="work-quick-editor-note"><b>Fotos</b><p>Para reemplazar una foto, eliminá la incorrecta con la × del book y tocá ＋ para subir la nueva. El límite sigue siendo 3 imágenes.</p></div>
          {message && <p className="work-quick-editor-message">{message}</p>}
          <button className="work-quick-editor-save" disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</button>
        </form>}
      </section>
    </div>}
  </>;
}
