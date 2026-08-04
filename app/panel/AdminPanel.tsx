"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { metroClima } from "@/lib/metroclima";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

type Tab = "resumen" | "consultas" | "presupuestos" | "comprobantes" | "clientes" | "materiales" | "equipo";
type Line = { id: number; description: string; quantity: number; unitPrice: number };
type Profile = { id: string; nombre: string; activo: boolean };
type Answer = { id: string; respuesta: string; publica: boolean; creado_en: string; autor_id: string };
type Consultation = {
  id: string;
  categoria: string;
  titulo: string;
  consulta: string;
  nombre_publico: string;
  acepta_contacto: boolean;
  email: string | null;
  telefono: string | null;
  localidad: string | null;
  estado: string;
  creado_en: string;
  respuestas?: Answer[];
};
type Client = {
  id: string;
  tipo: string;
  nombre_razon_social: string;
  telefono: string | null;
  email: string | null;
  localidad: string | null;
  direccion: string | null;
};
type Material = {
  id: string;
  codigo: string | null;
  nombre: string;
  unidad: string;
  costo_referencia: number;
  controla_stock: boolean;
  stock_actual: number | null;
  stock_minimo: number | null;
  activo: boolean;
};
type Budget = {
  id: string;
  numero: number;
  titulo: string;
  total: number;
  estado: string;
  creado_en: string;
  validez_dias: number;
  clientes: { nombre_razon_social: string; localidad: string | null } | null;
};
type Invoice = {
  id: string;
  tipo: string;
  punto_venta: number | null;
  numero: number | null;
  total: number;
  estado: string;
  emitido_en: string | null;
  creado_en: string;
  clientes: { nombre_razon_social: string } | null;
};
type AllowedAdmin = { email: string; nombre: string; activo: boolean };

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" });

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  en_seguimiento: "En seguimiento",
  respondida: "Respondida",
  presupuestada: "Presupuestada",
  archivada: "Archivada",
  borrador: "Borrador",
  enviado: "Enviado",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
  vencido: "Vencido",
};

function labelStatus(value: string) {
  return statusLabels[value] ?? value;
}

function Status({ value }: { value: string }) {
  const label = labelStatus(value);
  return <span className={`admin-status status-${label.toLocaleLowerCase("es").replaceAll(" ", "-")}`}>{label}</span>;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "MC";
}

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>("resumen");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(hasSupabaseConfig);
  const [fatalError, setFatalError] = useState(hasSupabaseConfig ? "" : "La conexión segura todavía no está configurada.");
  const [notice, setNotice] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState("");
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allowedAdmins, setAllowedAdmins] = useState<AllowedAdmin[]>([]);

  async function loadData() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const [questionResult, clientResult, materialResult, budgetResult, invoiceResult, adminResult] = await Promise.all([
      supabase.from("consultas").select("*,respuestas(id,respuesta,publica,creado_en,autor_id)").order("creado_en", { ascending: false }),
      supabase.from("clientes").select("id,tipo,nombre_razon_social,telefono,email,localidad,direccion").order("nombre_razon_social"),
      supabase.from("materiales").select("id,codigo,nombre,unidad,costo_referencia,controla_stock,stock_actual,stock_minimo,activo").eq("activo", true).order("nombre"),
      supabase.from("presupuestos").select("id,numero,titulo,total,estado,creado_en,validez_dias,clientes(nombre_razon_social,localidad)").order("creado_en", { ascending: false }),
      supabase.from("comprobantes").select("id,tipo,punto_venta,numero,total,estado,emitido_en,creado_en,clientes(nombre_razon_social)").order("creado_en", { ascending: false }),
      supabase.from("admin_emails_permitidos").select("email,nombre,activo").order("nombre"),
    ]);

    const firstError = [questionResult, clientResult, materialResult, budgetResult, invoiceResult, adminResult].find((result) => result.error)?.error;
    if (firstError) throw firstError;

    setConsultations((questionResult.data ?? []) as Consultation[]);
    setClients((clientResult.data ?? []) as Client[]);
    setMaterials((materialResult.data ?? []) as Material[]);
    setBudgets((budgetResult.data ?? []) as unknown as Budget[]);
    setInvoices((invoiceResult.data ?? []) as unknown as Invoice[]);
    setAllowedAdmins((adminResult.data ?? []) as AllowedAdmin[]);
  }

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let mounted = true;
    async function start() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        window.location.replace("/ingreso");
        return;
      }
      const { data: ownProfile, error } = await supabase
        .from("perfiles")
        .select("id,nombre,activo")
        .eq("id", session.user.id)
        .maybeSingle();
      if (error || !ownProfile?.activo) {
        await supabase.auth.signOut();
        window.location.replace("/ingreso");
        return;
      }
      if (!mounted) return;
      setProfile(ownProfile as Profile);
      setUserId(session.user.id);
      try {
        await loadData();
      } catch {
        setFatalError("No pudimos cargar la información. Revisá la conexión e intentá nuevamente.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void start();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") window.location.replace("/ingreso");
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function refresh(message?: string) {
    try {
      await loadData();
      if (message) setNotice(message);
    } catch {
      setNotice("No pudimos actualizar la información.");
    }
  }

  async function signOut() {
    await getSupabaseBrowserClient()?.auth.signOut();
    window.location.replace("/ingreso");
  }

  function selectTab(next: Tab) {
    setTab(next);
    setMenuOpen(false);
    setNotice("");
  }

  if (loading) return <main className="admin-loading"><img src="/metroclima-logo.png" alt="MetroClima" /><span></span><p>Abriendo el área privada…</p></main>;

  if (fatalError || !profile) return <main className="admin-loading admin-error"><img src="/metroclima-logo.png" alt="MetroClima" /><h1>No pudimos abrir el panel</h1><p>{fatalError}</p><Link className="button button-primary" href="/ingreso">Volver al ingreso</Link></main>;

  const pendingCount = consultations.filter((item) => item.estado === "pendiente").length;
  const navItems: { id: Tab; label: string; mark: string; count?: number }[] = [
    { id: "resumen", label: "Resumen", mark: "⌂" },
    { id: "consultas", label: "Consultas", mark: "?", count: pendingCount || undefined },
    { id: "presupuestos", label: "Presupuestos", mark: "$" },
    { id: "comprobantes", label: "Comprobantes", mark: "▤" },
    { id: "clientes", label: "Clientes", mark: "◎" },
    { id: "materiales", label: "Materiales", mark: "◇" },
    { id: "equipo", label: "Equipo y accesos", mark: "⚙" },
  ];

  return (
    <main className={`admin-layout ${menuOpen ? "menu-open" : ""}`}>
      <aside className="admin-sidebar">
        <Link className="brand admin-brand" href="/">
          <span className="brand-mark"><img src="/metroclima-logo.png" alt="" /></span>
          <span className="brand-copy"><strong>METRO<span>CLIMA</span></strong><small>Panel de gestión</small></span>
        </Link>
        <nav>
          <p>Principal</p>
          {navItems.slice(0, 4).map((item) => <button key={item.id} className={tab === item.id ? "is-active" : ""} onClick={() => selectTab(item.id)}><span>{item.mark}</span>{item.label}{item.count ? <b>{item.count}</b> : null}</button>)}
          <p>Organización</p>
          {navItems.slice(4).map((item) => <button key={item.id} className={tab === item.id ? "is-active" : ""} onClick={() => selectTab(item.id)}><span>{item.mark}</span>{item.label}</button>)}
        </nav>
        <div className="admin-user">
          <span>{initials(profile.nombre)}</span><div><strong>{profile.nombre}</strong><small>Administrador</small></div><button onClick={signOut} aria-label="Cerrar sesión">↪</button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir navegación">☰</button>
          <div className="admin-private"><span></span> Área privada y conectada</div>
          <div className="admin-top-actions"><Link href="/" target="_blank">Ver sitio ↗</Link><button onClick={signOut}>Salir</button></div>
        </header>

        <div className="admin-content">
          {tab === "resumen" && <Dashboard profile={profile} consultations={consultations} budgets={budgets} invoices={invoices} onNavigate={selectTab} />}
          {tab === "consultas" && <Questions consultations={consultations} userId={userId} onRefresh={refresh} />}
          {tab === "presupuestos" && <Budgets budgets={budgets} clients={clients} userId={userId} onRefresh={refresh} />}
          {tab === "comprobantes" && <Invoices invoices={invoices} />}
          {tab === "clientes" && <Clients clients={clients} onRefresh={refresh} />}
          {tab === "materiales" && <Materials materials={materials} onRefresh={refresh} />}
          {tab === "equipo" && <TeamAccess admins={allowedAdmins} onRefresh={refresh} />}
          {notice && <div className="admin-toast" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
        </div>
      </section>
      {menuOpen && <button className="admin-overlay" aria-label="Cerrar navegación" onClick={() => setMenuOpen(false)} />}
    </main>
  );
}

function PageTitle({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: ReactNode }) {
  return <div className="admin-page-title"><div><span>{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{action}</div>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="admin-empty"><span>◇</span><h3>{title}</h3><p>{text}</p></div>;
}

function Dashboard({ profile, consultations, budgets, invoices, onNavigate }: { profile: Profile; consultations: Consultation[]; budgets: Budget[]; invoices: Invoice[]; onNavigate: (tab: Tab) => void }) {
  const pending = consultations.filter((item) => item.estado === "pendiente");
  const openBudgets = budgets.filter((item) => ["borrador", "enviado"].includes(item.estado));
  const accepted = budgets.filter((item) => item.estado === "aceptado");
  const billed = invoices.filter((item) => item.estado !== "borrador").reduce((sum, item) => sum + Number(item.total), 0);
  return <>
    <PageTitle eyebrow={shortDate.format(new Date())} title={`Buen día, ${profile.nombre}.`} text="Este es el estado real de MetroClima." action={<button className="admin-primary" onClick={() => onNavigate("presupuestos")}>＋ Nuevo presupuesto</button>} />
    <div className="metric-grid">
      <article><span>Consultas nuevas</span><strong>{pending.length}</strong><small>pendientes de respuesta</small><i>?</i></article>
      <article><span>Presupuestos abiertos</span><strong>{openBudgets.length}</strong><small>{money.format(openBudgets.reduce((sum, item) => sum + Number(item.total), 0))} potenciales</small><i>$</i></article>
      <article><span>Presupuestos aceptados</span><strong>{accepted.length}</strong><small>trabajos confirmados</small><i>✓</i></article>
      <article><span>Comprobantes emitidos</span><strong>{money.format(billed)}</strong><small>total registrado</small><i>▤</i></article>
    </div>
    <div className="admin-dashboard-grid">
      <section className="admin-card attention-card">
        <div className="admin-card-head"><div><h2>Requieren atención</h2><p>Consultas pendientes</p></div><button onClick={() => onNavigate("consultas")}>Ver todas →</button></div>
        {pending.length ? <div className="attention-list">{pending.slice(0, 4).map((item, index) => <button key={item.id} onClick={() => onNavigate("consultas")}><span className={`avatar avatar-${index % 4}`}>{initials(item.nombre_publico)}</span><div><strong>{item.titulo}</strong><small>{item.nombre_publico} · {item.localidad || "Sin zona"}</small></div><time>{shortDate.format(new Date(item.creado_en))}</time><b>›</b></button>)}</div> : <EmptyState title="Todo al día" text="No hay consultas pendientes." />}
      </section>
      <section className="admin-card agenda-card">
        <div className="admin-card-head"><div><h2>Actividad comercial</h2><p>Últimos presupuestos</p></div><button onClick={() => onNavigate("presupuestos")}>Gestionar →</button></div>
        {budgets.slice(0, 3).map((item) => <div className="agenda-date" key={item.id}><strong>{String(item.numero).padStart(3, "0")}</strong><span>PRE<small>{shortDate.format(new Date(item.creado_en))}</small></span><div><b>{money.format(Number(item.total))}</b><p>{item.titulo}</p><small>{item.clientes?.nombre_razon_social || "Cliente sin vincular"}</small></div></div>)}
        {!budgets.length && <EmptyState title="Sin presupuestos todavía" text="Creá el primero desde el módulo Presupuestos." />}
      </section>
    </div>
  </>;
}

function Questions({ consultations, userId, onRefresh }: { consultations: Consultation[]; userId: string; onRefresh: (message?: string) => Promise<void> }) {
  const [selectedId, setSelectedId] = useState(consultations[0]?.id ?? "");
  const selected = consultations.find((item) => item.id === selectedId) ?? consultations[0];
  const latestAnswer = selected?.respuestas?.filter((answer) => answer.publica).sort((a, b) => b.creado_en.localeCompare(a.creado_en))[0];
  const [reply, setReply] = useState(latestAnswer?.respuesta ?? "");
  const [saving, setSaving] = useState(false);

  function chooseQuestion(item: Consultation) {
    const next = item.respuestas?.filter((answer) => answer.publica).sort((a, b) => b.creado_en.localeCompare(a.creado_en))[0];
    setSelectedId(item.id);
    setReply(next?.respuesta ?? "");
  }

  async function publishAnswer() {
    if (!selected || reply.trim().length < 3) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true);
    const answerResult = latestAnswer
      ? await supabase.from("respuestas").update({ respuesta: reply.trim() }).eq("id", latestAnswer.id)
      : await supabase.from("respuestas").insert({ consulta_id: selected.id, autor_id: userId, respuesta: reply.trim(), publica: true });
    if (!answerResult.error) {
      await supabase.from("consultas").update({ estado: "respondida" }).eq("id", selected.id);
      await onRefresh("✓ Respuesta publicada en el foro");
    }
    setSaving(false);
  }

  async function changeState(estado: string) {
    if (!selected) return;
    const { error } = await getSupabaseBrowserClient()!.from("consultas").update({ estado }).eq("id", selected.id);
    if (!error) await onRefresh("✓ Estado de la consulta actualizado");
  }

  if (!consultations.length) return <><PageTitle eyebrow="Atención comercial" title="Consultas" text="Las consultas nuevas aparecerán aquí sin exponer los datos privados en el foro." /><section className="admin-card"><EmptyState title="Todavía no hay consultas" text="Cuando una persona envíe el formulario, la vas a ver en esta bandeja." /></section></>;

  return <>
    <PageTitle eyebrow="Atención comercial" title="Consultas" text="Respondé el foro y usá los datos privados sólo cuando la persona pidió ser contactada." action={<span className="connected-chip">● Datos en tiempo real</span>} />
    <div className="questions-admin-grid">
      <section className="admin-card admin-inbox">
        {consultations.map((item, index) => <button key={item.id} className={item.id === selected?.id ? "is-selected" : ""} onClick={() => chooseQuestion(item)}><span className={`avatar avatar-${index % 4}`}>{initials(item.nombre_publico)}</span><div><strong>{item.titulo}</strong><p>{item.nombre_publico} · {item.localidad || "Sin zona"}</p><small>{shortDate.format(new Date(item.creado_en))}</small></div><Status value={item.estado} /></button>)}
      </section>
      {selected && <section className="admin-card question-detail">
        <div className="detail-head"><span className="avatar avatar-0">{initials(selected.nombre_publico)}</span><div><h2>{selected.titulo}</h2><p>{selected.nombre_publico} · {shortDate.format(new Date(selected.creado_en))}</p></div><Status value={selected.estado} /></div>
        <span className="category-pill">{selected.categoria}</span>
        <blockquote>“{selected.consulta}”</blockquote>
        {selected.acepta_contacto ? <div className="private-contact-box"><div><span>Datos privados</span><strong>Solicitó ser contactado/a</strong></div>{selected.telefono && <p><b>Teléfono</b> {selected.telefono}</p>}{selected.email && <p><b>Correo</b> {selected.email}</p>}{selected.localidad && <p><b>Zona</b> {selected.localidad}</p>}</div> : <div className="private-contact-box no-contact"><div><span>Sin contacto</span><strong>La persona eligió no dejar datos privados.</strong></div></div>}
        <label className="reply-box"><span>Respuesta pública</span><textarea rows={6} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Escribí una respuesta clara para publicar en el foro." /></label>
        <div className="detail-actions"><select value={selected.estado} onChange={(event) => changeState(event.target.value)}><option value="pendiente">Pendiente</option><option value="en_seguimiento">En seguimiento</option><option value="presupuestada">Presupuestada</option><option value="archivada">Archivada</option></select><button className="admin-primary" onClick={publishAnswer} disabled={saving}>{saving ? "Publicando…" : latestAnswer ? "Actualizar respuesta" : "Publicar respuesta"}</button></div>
      </section>}
    </div>
  </>;
}

function Budgets({ budgets, clients, userId, onRefresh }: { budgets: Budget[]; clients: Client[]; userId: string; onRefresh: (message?: string) => Promise<void> }) {
  const [builder, setBuilder] = useState(false);
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [validity, setValidity] = useState(15);
  const [taxMode, setTaxMode] = useState("monotributo_iva_no_discriminado");
  const [paymentTerms, setPaymentTerms] = useState(metroClima.paymentMethods);
  const [warrantyTerms, setWarrantyTerms] = useState(metroClima.warranty);
  const [labor, setLabor] = useState<Line[]>([{ id: 1, description: "Instalación estándar de equipo split", quantity: 1, unitPrice: 0 }]);
  const [materialLines, setMaterialLines] = useState<Line[]>([{ id: 2, description: "Kit de instalación", quantity: 1, unitPrice: 0 }]);
  const [saving, setSaving] = useState(false);
  const selectedClient = clients.find((item) => item.id === clientId);

  const totals = useMemo(() => {
    const laborTotal = labor.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const materialsTotal = materialLines.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const subtotal = laborTotal + materialsTotal;
    const tax = taxMode === "responsable_inscripto_iva_21" ? subtotal * 0.21 : 0;
    return { laborTotal, materialsTotal, tax, total: subtotal + tax };
  }, [labor, materialLines, taxMode]);

  function updateLine(kind: "labor" | "materials", id: number, field: keyof Line, value: string) {
    const setter = kind === "labor" ? setLabor : setMaterialLines;
    setter((items) => items.map((item) => item.id === id ? { ...item, [field]: field === "description" ? value : Number(value) } : item));
  }
  function addLine(kind: "labor" | "materials") {
    const line = { id: Date.now(), description: "", quantity: 1, unitPrice: 0 };
    (kind === "labor" ? setLabor : setMaterialLines)((items) => [...items, line]);
  }
  function removeLine(kind: "labor" | "materials", id: number) {
    (kind === "labor" ? setLabor : setMaterialLines)((items) => items.filter((item) => item.id !== id));
  }

  async function saveBudget() {
    if (!clientId || !title.trim()) {
      await onRefresh("Completá el cliente y la descripción del trabajo.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true);
    const { data, error } = await supabase.from("presupuestos").insert({
      cliente_id: clientId,
      titulo: title.trim(),
      tratamiento_fiscal: taxMode,
      subtotal_mano_obra: totals.laborTotal,
      subtotal_materiales: totals.materialsTotal,
      iva: totals.tax,
      total: totals.total,
      validez_dias: validity,
      condiciones_pago: paymentTerms,
      garantia: warrantyTerms,
      creado_por: userId,
      estado: "borrador",
    }).select("id").single();
    if (error || !data) {
      setSaving(false);
      await onRefresh("No pudimos guardar el presupuesto.");
      return;
    }
    const items = [
      ...labor.filter((item) => item.description.trim()).map((item, order) => ({ presupuesto_id: data.id, tipo: "mano_obra", descripcion: item.description.trim(), cantidad: item.quantity, precio_unitario: item.unitPrice, orden: Number(order) })),
      ...materialLines.filter((item) => item.description.trim()).map((item, order) => ({ presupuesto_id: data.id, tipo: "material", descripcion: item.description.trim(), cantidad: item.quantity, precio_unitario: item.unitPrice, orden: labor.length + order })),
    ];
    const itemResult = items.length ? await supabase.from("items_presupuesto").insert(items) : { error: null };
    if (itemResult.error) {
      await supabase.from("presupuestos").delete().eq("id", data.id);
      setSaving(false);
      await onRefresh("No pudimos guardar los ítems del presupuesto.");
      return;
    }
    setSaving(false);
    setBuilder(false);
    setTitle("");
    await onRefresh("✓ Presupuesto guardado correctamente");
  }

  async function updateBudgetState(id: string, estado: string) {
    const { error } = await getSupabaseBrowserClient()!.from("presupuestos").update({ estado }).eq("id", id);
    if (!error) await onRefresh("✓ Estado del presupuesto actualizado");
  }

  if (!builder) return <>
    <PageTitle eyebrow="Gestión comercial" title="Presupuestos" text="Documentos guardados con mano de obra y materiales separados." action={<button className="admin-primary" onClick={() => setBuilder(true)}>＋ Crear presupuesto</button>} />
    <section className="admin-card recent-budgets full-list">
      <div className="admin-card-head"><div><h2>Todos los presupuestos</h2><p>{budgets.length} documentos guardados</p></div><span className="connected-chip">● Datos en tiempo real</span></div>
      {budgets.length ? <div className="admin-table"><div className="table-row table-head"><span>Número</span><span>Cliente</span><span>Trabajo</span><span>Total</span><span>Estado</span><span>Fecha</span></div>{budgets.map((row) => <div className="table-row" key={row.id}><span>PRE-{new Date(row.creado_en).getFullYear()}-{String(row.numero).padStart(4, "0")}</span><span><b>{row.clientes?.nombre_razon_social || "Sin cliente"}</b></span><span>{row.titulo}</span><span><b>{money.format(Number(row.total))}</b></span><span><select className="status-select" value={row.estado} onChange={(event) => updateBudgetState(row.id, event.target.value)}><option value="borrador">Borrador</option><option value="enviado">Enviado</option><option value="aceptado">Aceptado</option><option value="rechazado">Rechazado</option><option value="vencido">Vencido</option></select></span><span>{shortDate.format(new Date(row.creado_en))}</span></div>)}</div> : <EmptyState title="Todavía no hay presupuestos" text="Creá el primero y quedará guardado en esta lista." />}
    </section>
  </>;

  return <>
    <PageTitle eyebrow="Nuevo documento" title="Crear presupuesto" text="Completá los datos y revisá el documento membretado antes de guardarlo." action={<button className="admin-secondary" onClick={() => setBuilder(false)}>← Volver al listado</button>} />
    <div className="budget-builder-grid">
      <section className="admin-card budget-form">
        <div className="form-section-title"><span>01</span><div><h2>Cliente y trabajo</h2><p>Información principal del documento</p></div></div>
        <div className="form-row two"><label><span>Cliente</span><select value={clientId} onChange={(event) => setClientId(event.target.value)} required><option value="">Seleccionar cliente</option>{clients.map((client) => <option value={client.id} key={client.id}>{client.nombre_razon_social}</option>)}</select></label><label><span>Validez</span><select value={validity} onChange={(event) => setValidity(Number(event.target.value))}><option value={7}>7 días</option><option value={15}>15 días</option><option value={30}>30 días</option></select></label></div>
        {!clients.length && <p className="inline-warning">Primero cargá un cliente desde el módulo Clientes.</p>}
        <label><span>Trabajo / descripción general</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Instalación de equipo split en living" /></label>
        <div className="form-section-title"><span>02</span><div><h2>Mano de obra</h2><p>Servicios realizados por MetroClima</p></div></div>
        <LineEditor kind="labor" lines={labor} onUpdate={updateLine} onAdd={addLine} onRemove={removeLine} />
        <div className="form-section-title"><span>03</span><div><h2>Materiales</h2><p>Insumos separados del trabajo</p></div></div>
        <LineEditor kind="materials" lines={materialLines} onUpdate={updateLine} onAdd={addLine} onRemove={removeLine} />
        <div className="form-section-title"><span>04</span><div><h2>Tratamiento fiscal</h2><p>Configuración visible en el presupuesto</p></div></div>
        <label><span>Condición del emisor</span><select value={taxMode} onChange={(event) => setTaxMode(event.target.value)}><option value="monotributo_iva_no_discriminado">Monotributo · IVA no discriminado</option><option value="sin_impuesto_agregado">Presupuesto informativo · sin impuesto agregado</option><option value="responsable_inscripto_iva_21">Responsable inscripto · IVA 21% (futuro)</option></select></label>
        <div className="fiscal-note"><span>i</span><p>Con el régimen actual se prevé comprobante tipo C y el IVA no se discrimina. La alternativa del 21% queda preparada para un cambio futuro.</p></div>
        <div className="form-section-title"><span>05</span><div><h2>Condiciones comerciales</h2><p>Información visible para el cliente</p></div></div>
        <label><span>Condiciones de pago</span><input value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} /></label>
        <label><span>Garantía</span><input value={warrantyTerms} onChange={(event) => setWarrantyTerms(event.target.value)} /></label>
        <div className="builder-actions"><button type="button" onClick={() => window.print()}>Imprimir / PDF</button><button className="admin-primary" onClick={saveBudget} disabled={saving}>{saving ? "Guardando…" : "Guardar presupuesto"}</button></div>
      </section>
      <aside className="budget-preview">
        <div className="document-paper">
          <header><div className="document-brand"><img src="/metroclima-logo.png" alt="" /><div><strong>METROCLIMA</strong><small>Climatización profesional</small></div></div><div><b>PRESUPUESTO</b><span>NUEVO</span></div></header>
          <div className="document-meta"><div><small>CLIENTE</small><strong>{selectedClient?.nombre_razon_social || "Seleccionar cliente"}</strong><span>{selectedClient?.localidad || "Buenos Aires"}</span></div><div><small>FECHA</small><strong>{new Intl.DateTimeFormat("es-AR").format(new Date())}</strong><span>Válido por {validity} días</span></div></div>
          <h3>{title || "Descripción del trabajo"}</h3>
          <div className="document-section"><b>MANO DE OBRA</b>{labor.map((line) => <div key={line.id}><span>{line.description || "Sin descripción"}<small>{line.quantity} × {money.format(line.unitPrice)}</small></span><strong>{money.format(line.quantity * line.unitPrice)}</strong></div>)}</div>
          <div className="document-section"><b>MATERIALES</b>{materialLines.map((line) => <div key={line.id}><span>{line.description || "Sin descripción"}<small>{line.quantity} × {money.format(line.unitPrice)}</small></span><strong>{money.format(line.quantity * line.unitPrice)}</strong></div>)}</div>
          <div className="document-totals"><div><span>Mano de obra</span><b>{money.format(totals.laborTotal)}</b></div><div><span>Materiales</span><b>{money.format(totals.materialsTotal)}</b></div>{totals.tax > 0 && <div><span>IVA 21%</span><b>{money.format(totals.tax)}</b></div>}<div className="grand-total"><span>TOTAL</span><b>{money.format(totals.total)}</b></div><small>{taxMode === "monotributo_iva_no_discriminado" ? "IVA no discriminado · Comprobante tipo C" : taxMode === "responsable_inscripto_iva_21" ? "IVA discriminado al 21%" : "Sin impuesto agregado"}</small></div>
          <div className="document-conditions"><div><small>CONDICIONES DE PAGO</small><strong>{paymentTerms}</strong></div><div><small>GARANTÍA</small><strong>{warrantyTerms}</strong></div></div>
          <footer><div><small>RESPONSABLES</small><strong>Cristian · Nicolás</strong></div><div><small>CONTACTO</small><strong>WhatsApp · {metroClima.whatsapp[0].display} / {metroClima.whatsapp[1].display}</strong></div></footer>
        </div>
        <p>Vista previa · Usá “Imprimir / PDF” para descargarla.</p>
      </aside>
    </div>
  </>;
}

function LineEditor({ kind, lines, onUpdate, onAdd, onRemove }: { kind: "labor" | "materials"; lines: Line[]; onUpdate: (kind: "labor" | "materials", id: number, field: keyof Line, value: string) => void; onAdd: (kind: "labor" | "materials") => void; onRemove: (kind: "labor" | "materials", id: number) => void }) {
  return <div className="line-editor"><div className="line-head"><span>Descripción</span><span>Cant.</span><span>Precio unit.</span><span>Total</span><span></span></div>{lines.map((line) => <div className="line-row" key={line.id}><input value={line.description} onChange={(event) => onUpdate(kind, line.id, "description", event.target.value)} placeholder="Descripción" /><input type="number" min="0.001" step="0.001" value={line.quantity} onChange={(event) => onUpdate(kind, line.id, "quantity", event.target.value)} /><input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(event) => onUpdate(kind, line.id, "unitPrice", event.target.value)} /><b>{money.format(line.quantity * line.unitPrice)}</b><button type="button" onClick={() => onRemove(kind, line.id)} aria-label="Eliminar ítem">×</button></div>)}<button className="add-line" type="button" onClick={() => onAdd(kind)}>＋ Agregar ítem</button></div>;
}

function Invoices({ invoices }: { invoices: Invoice[] }) {
  return <>
    <PageTitle eyebrow="Documentación fiscal" title="Comprobantes" text="Facturas y recibos vinculados a cada trabajo y cliente." />
    <div className="arca-banner"><div><span>ARCA</span><p><strong>Integración preparada, todavía no activada</strong>La emisión automática se habilitará al completar CUIT, domicilio fiscal, certificado, clave privada y punto de venta de cada responsable.</p></div></div>
    <section className="admin-card recent-budgets full-list"><div className="admin-card-head"><div><h2>Comprobantes registrados</h2><p>Régimen actual: Monotributo</p></div><Status value="Factura C" /></div>{invoices.length ? <div className="admin-table invoices-table"><div className="table-row table-head"><span>Comprobante</span><span>Cliente</span><span>Fecha</span><span>Total</span><span>Estado</span><span></span></div>{invoices.map((row) => <div className="table-row" key={row.id}><span><b>{row.numero ? `${row.tipo} ${String(row.punto_venta || 0).padStart(5, "0")}-${String(row.numero).padStart(8, "0")}` : row.tipo}</b></span><span>{row.clientes?.nombre_razon_social || "Sin cliente"}</span><span>{shortDate.format(new Date(row.emitido_en || row.creado_en))}</span><span><b>{money.format(Number(row.total))}</b></span><span><Status value={row.estado} /></span><span></span></div>)}</div> : <EmptyState title="Todavía no hay comprobantes" text="Este módulo se activará por completo al configurar los datos fiscales de ARCA." />}</section>
  </>;
}

function Clients({ clients, onRefresh }: { clients: Client[]; onRefresh: (message?: string) => Promise<void> }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  async function createClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const { error } = await getSupabaseBrowserClient()!.from("clientes").insert({
      tipo: String(form.get("tipo") || "persona"),
      nombre_razon_social: String(form.get("nombre") || "").trim(),
      telefono: String(form.get("telefono") || "").trim() || null,
      email: String(form.get("email") || "").trim() || null,
      localidad: String(form.get("localidad") || "").trim() || null,
      direccion: String(form.get("direccion") || "").trim() || null,
    });
    setSaving(false);
    if (!error) {
      setShowForm(false);
      await onRefresh("✓ Cliente guardado correctamente");
    }
  }
  return <>
    <PageTitle eyebrow="Base comercial" title="Clientes" text="Información privada para presupuestos, trabajos y comprobantes." action={<button className="admin-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "Cerrar" : "＋ Nuevo cliente"}</button>} />
    {showForm && <form className="admin-card quick-form" onSubmit={createClient}><div className="form-row two"><label><span>Tipo</span><select name="tipo"><option value="persona">Persona</option><option value="empresa">Empresa</option></select></label><label><span>Nombre o razón social</span><input name="nombre" required /></label></div><div className="form-row two"><label><span>Teléfono</span><input name="telefono" type="tel" /></label><label><span>Correo</span><input name="email" type="email" /></label></div><div className="form-row two"><label><span>Localidad</span><input name="localidad" /></label><label><span>Dirección</span><input name="direccion" /></label></div><button className="admin-primary" disabled={saving}>{saving ? "Guardando…" : "Guardar cliente"}</button></form>}
    {clients.length ? <div className="client-grid">{clients.map((client, index) => <article className="admin-card client-card" key={client.id}><span className={`avatar avatar-${index % 4}`}>{initials(client.nombre_razon_social)}</span><div><h2>{client.nombre_razon_social}</h2><p>{client.tipo === "empresa" ? "Empresa" : "Persona"} · {client.localidad || "Sin localidad"}</p></div><dl><div><dt>Teléfono</dt><dd>{client.telefono || "—"}</dd></div><div><dt>Correo</dt><dd>{client.email || "—"}</dd></div></dl></article>)}</div> : <section className="admin-card"><EmptyState title="Todavía no hay clientes" text="Cargá el primero para poder crear un presupuesto." /></section>}
  </>;
}

function Materials({ materials, onRefresh }: { materials: Material[]; onRefresh: (message?: string) => Promise<void> }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  async function createMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const { error } = await getSupabaseBrowserClient()!.from("materiales").insert({
      codigo: String(form.get("codigo") || "").trim() || null,
      nombre: String(form.get("nombre") || "").trim(),
      unidad: String(form.get("unidad") || "unidad").trim(),
      costo_referencia: Number(form.get("costo") || 0),
      controla_stock: false,
    });
    setSaving(false);
    if (!error) {
      setShowForm(false);
      await onRefresh("✓ Material agregado al catálogo");
    }
  }
  async function archiveMaterial(id: string) {
    const { error } = await getSupabaseBrowserClient()!.from("materiales").update({ activo: false }).eq("id", id);
    if (!error) await onRefresh("✓ Material archivado");
  }
  return <>
    <PageTitle eyebrow="Preparado para crecer" title="Materiales" text="Catálogo de insumos con precios de referencia. El stock puede activarse más adelante." action={<button className="admin-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "Cerrar" : "＋ Agregar material"}</button>} />
    <div className="future-stock-banner"><span>◇</span><div><strong>Modo catálogo activo</strong><p>Podés usar estos materiales al presupuestar. El control de entradas, salidas y alertas queda preparado para una segunda etapa.</p></div></div>
    {showForm && <form className="admin-card quick-form" onSubmit={createMaterial}><div className="form-row two"><label><span>Código opcional</span><input name="codigo" /></label><label><span>Material</span><input name="nombre" required /></label></div><div className="form-row two"><label><span>Unidad</span><input name="unidad" required placeholder="metro, juego, unidad" /></label><label><span>Precio de referencia</span><input name="costo" type="number" min="0" step="0.01" /></label></div><button className="admin-primary" disabled={saving}>{saving ? "Guardando…" : "Guardar material"}</button></form>}
    <section className="admin-card materials-table">{materials.length ? <div className="admin-table"><div className="table-row table-head"><span>Material</span><span>Código</span><span>Unidad</span><span>Precio ref.</span><span>Stock</span><span></span></div>{materials.map((item) => <div className="table-row" key={item.id}><span><b>{item.nombre}</b></span><span>{item.codigo || "—"}</span><span>{item.unidad}</span><span>{money.format(Number(item.costo_referencia))}</span><span>{item.controla_stock ? `${item.stock_actual ?? 0}` : "Catálogo"}</span><span><button className="table-action" onClick={() => archiveMaterial(item.id)}>Archivar</button></span></div>)}</div> : <EmptyState title="Catálogo vacío" text="Agregá materiales para tener precios de referencia al presupuestar." />}</section>
  </>;
}

function TeamAccess({ admins, onRefresh }: { admins: AllowedAdmin[]; onRefresh: (message?: string) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  async function allowAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const nombre = String(form.get("nombre") || "").trim();
    const { error } = await getSupabaseBrowserClient()!.from("admin_emails_permitidos").upsert({ email, nombre, activo: true });
    setSaving(false);
    if (!error) {
      event.currentTarget.reset();
      await onRefresh("✓ Cuenta autorizada. Ya puede activarse desde la pantalla de ingreso.");
    }
  }
  async function toggleAdmin(admin: AllowedAdmin) {
    const { error } = await getSupabaseBrowserClient()!.from("admin_emails_permitidos").update({ activo: !admin.activo }).eq("email", admin.email);
    if (!error) await onRefresh(admin.activo ? "✓ Acceso desactivado" : "✓ Acceso reactivado");
  }
  return <>
    <PageTitle eyebrow="Seguridad" title="Equipo y accesos" text="Sólo los correos autorizados pueden activar una cuenta y abrir el panel." />
    <div className="team-access-grid">
      <section className="admin-card"><div className="admin-card-head"><div><h2>Cuentas autorizadas</h2><p>Los correos nunca se muestran en la web pública.</p></div><span className="connected-chip">Máximo previsto: 2</span></div><div className="access-list">{admins.map((admin) => <div key={admin.email}><span>{initials(admin.nombre)}</span><div><strong>{admin.nombre}</strong><small>{admin.email}</small></div><Status value={admin.activo ? "Activo" : "Inactivo"} /><button onClick={() => toggleAdmin(admin)}>{admin.activo ? "Desactivar" : "Reactivar"}</button></div>)}</div>{!admins.length && <EmptyState title="Sin cuentas autorizadas" text="Agregá el primer correo administrador." />}</section>
      <form className="admin-card quick-form" onSubmit={allowAdmin}><h2>Autorizar una cuenta</h2><p>Cuando agregues el correo de Cristian, podrá elegir su propia contraseña desde “Activar cuenta”.</p><label><span>Nombre</span><input name="nombre" required placeholder="Cristian" /></label><label><span>Correo privado</span><input name="email" type="email" required /></label><button className="admin-primary" disabled={saving || admins.filter((admin) => admin.activo).length >= 2}>{saving ? "Autorizando…" : "Autorizar correo"}</button>{admins.filter((admin) => admin.activo).length >= 2 && <small className="inline-warning">Ya están activas las dos cuentas previstas.</small>}</form>
    </div>
  </>;
}
