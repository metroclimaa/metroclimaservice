"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { metroClima } from "@/lib/metroclima";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

type Tab = "resumen" | "consultas" | "presupuestos" | "trabajos" | "clientes" | "materiales" | "comprobantes" | "estadisticas" | "equipo";
type Line = { id: number; description: string; quantity: number; unitPrice: number };
type BudgetMode = "simple" | "comparativo";
type BudgetOption = "low" | "high";
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
  total_high: number;
  modalidad: BudgetMode;
  estado: string;
  creado_en: string;
  validez_dias: number;
  rubro: "climatizacion" | "electricidad";
  review_token: string;
  clientes: { nombre_razon_social: string; localidad: string | null } | null;
};
type WorkImage = { id: string; trabajo_id: string; storage_path: string; orden: number; alt: string };
type Work = {
  id: string;
  presupuesto_id: string;
  titulo_publico: string;
  resumen: string;
  localidad_publica: string | null;
  fecha_realizacion: string | null;
  publicado: boolean;
  destacado: boolean;
  trabajo_imagenes: WorkImage[];
  presupuestos: { numero: number; titulo: string; rubro: "climatizacion" | "electricidad"; review_token: string; clientes: { nombre_razon_social: string } | null } | null;
};
type CustomerReview = {
  id: string;
  presupuesto_id: string;
  nombre_publico: string;
  puntuacion: number;
  comentario: string;
  aprobada: boolean;
  creado_en: string;
  presupuestos: { numero: number; titulo: string } | null;
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
type AnalyticsEvent = {
  id: string;
  event_type: "page_view" | "whatsapp_click" | "budget_click" | "service_interest";
  session_id: string;
  pathname: string;
  source: string;
  device_type: "celular" | "tablet" | "computadora";
  label: string | null;
  created_at: string;
};
type PasskeyRecord = {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
};

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" });

function calculateBudgetTotals(laborLines: Line[], materials: Line[], taxMode: string) {
  const laborTotal = laborLines.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const materialsTotal = materials.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const subtotal = laborTotal + materialsTotal;
  const tax = taxMode === "responsable_inscripto_iva_21" ? subtotal * 0.21 : 0;
  return { laborTotal, materialsTotal, tax, total: subtotal + tax };
}

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
  publicado: "Publicado",
  publicada: "Publicada",
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
  const [works, setWorks] = useState<Work[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allowedAdmins, setAllowedAdmins] = useState<AllowedAdmin[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [totalViews, setTotalViews] = useState(0);

  async function loadData() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const analyticsSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [questionResult, clientResult, materialResult, budgetResult, workResult, reviewResult, invoiceResult, adminResult, analyticsResult, totalViewsResult] = await Promise.all([
      supabase.from("consultas").select("*,respuestas(id,respuesta,publica,creado_en,autor_id)").order("creado_en", { ascending: false }),
      supabase.from("clientes").select("id,tipo,nombre_razon_social,telefono,email,localidad,direccion").order("nombre_razon_social"),
      supabase.from("materiales").select("id,codigo,nombre,unidad,costo_referencia,controla_stock,stock_actual,stock_minimo,activo").eq("activo", true).order("nombre"),
      supabase.from("presupuestos").select("id,numero,titulo,total,total_high,modalidad,estado,creado_en,validez_dias,rubro,review_token,clientes(nombre_razon_social,localidad)").order("creado_en", { ascending: false }),
      supabase.from("trabajos").select("id,presupuesto_id,titulo_publico,resumen,localidad_publica,fecha_realizacion,publicado,destacado,trabajo_imagenes(id,trabajo_id,storage_path,orden,alt),presupuestos(numero,titulo,rubro,review_token,clientes(nombre_razon_social))").order("creado_en", { ascending: false }),
      supabase.from("resenas_clientes").select("id,presupuesto_id,nombre_publico,puntuacion,comentario,aprobada,creado_en,presupuestos(numero,titulo)").order("creado_en", { ascending: false }),
      supabase.from("comprobantes").select("id,tipo,punto_venta,numero,total,estado,emitido_en,creado_en,clientes(nombre_razon_social)").order("creado_en", { ascending: false }),
      supabase.from("admin_emails_permitidos").select("email,nombre,activo").order("nombre"),
      supabase.from("analiticas_eventos").select("id,event_type,session_id,pathname,source,device_type,label,created_at").gte("created_at", analyticsSince).order("created_at", { ascending: true }),
      supabase.from("analiticas_eventos").select("id", { count: "exact", head: true }).eq("event_type", "page_view"),
    ]);

    const firstError = [questionResult, clientResult, materialResult, budgetResult, workResult, reviewResult, invoiceResult, adminResult, analyticsResult, totalViewsResult].find((result) => result.error)?.error;
    if (firstError) throw firstError;

    setConsultations((questionResult.data ?? []) as Consultation[]);
    setClients((clientResult.data ?? []) as Client[]);
    setMaterials((materialResult.data ?? []) as Material[]);
    setBudgets((budgetResult.data ?? []) as unknown as Budget[]);
    setWorks((workResult.data ?? []) as unknown as Work[]);
    setReviews((reviewResult.data ?? []) as unknown as CustomerReview[]);
    setInvoices((invoiceResult.data ?? []) as unknown as Invoice[]);
    setAllowedAdmins((adminResult.data ?? []) as AllowedAdmin[]);
    setAnalyticsEvents((analyticsResult.data ?? []) as AnalyticsEvent[]);
    setTotalViews(totalViewsResult.count ?? 0);
  }

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const client = supabase;

    let mounted = true;
    async function start() {
      const { data: sessionData } = await client.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        window.location.replace("/ingreso");
        return;
      }
      const { data: ownProfile, error } = await client
        .from("perfiles")
        .select("id,nombre,activo")
        .eq("id", session.user.id)
        .maybeSingle();
      if (error || !ownProfile?.activo) {
        await client.auth.signOut();
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

    const { data: listener } = client.auth.onAuthStateChange((event) => {
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
  const pendingReviews = reviews.filter((item) => !item.aprobada).length;
  const navItems: { id: Tab; label: string; mark: string; count?: number }[] = [
    { id: "resumen", label: "Resumen", mark: "⌂" },
    { id: "consultas", label: "Consultas", mark: "?", count: pendingCount || undefined },
    { id: "presupuestos", label: "Presupuestos", mark: "$" },
    { id: "trabajos", label: "Trabajos y reseñas", mark: "▦", count: pendingReviews || undefined },
    { id: "clientes", label: "Clientes", mark: "◎" },
    { id: "materiales", label: "Materiales", mark: "◇" },
    { id: "comprobantes", label: "Comprobantes", mark: "▤" },
    { id: "estadisticas", label: "Estadísticas", mark: "↗" },
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
          <p>Flujo comercial</p>
          {navItems.slice(0, 4).map((item) => <button key={item.id} className={tab === item.id ? "is-active" : ""} onClick={() => selectTab(item.id)}><span>{item.mark}</span>{item.label}{item.count ? <b>{item.count}</b> : null}</button>)}
          <p>Administración</p>
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
          {tab === "trabajos" && <Works works={works} reviews={reviews} budgets={budgets} userId={userId} onRefresh={refresh} />}
          {tab === "clientes" && <Clients clients={clients} onRefresh={refresh} />}
          {tab === "materiales" && <Materials materials={materials} onRefresh={refresh} />}
          {tab === "comprobantes" && <Invoices invoices={invoices} />}
          {tab === "estadisticas" && <Analytics events={analyticsEvents} totalViews={totalViews} />}
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

function Analytics({ events, totalViews }: { events: AnalyticsEvent[]; totalViews: number }) {
  const pageViews = events.filter((event) => event.event_type === "page_view");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  const todayViews = pageViews.filter((event) => new Date(event.created_at) >= today).length;
  const sevenDayViews = pageViews.filter((event) => new Date(event.created_at) >= sevenDaysAgo).length;
  const approximateVisitors = new Set(pageViews.map((event) => event.session_id)).size;
  const whatsappClicks = events.filter((event) => event.event_type === "whatsapp_click").length;
  const budgetClicks = events.filter((event) => event.event_type === "budget_click").length;

  function rank(list: AnalyticsEvent[], key: (event: AnalyticsEvent) => string) {
    const counts = new Map<string, number>();
    list.forEach((event) => {
      const label = key(event) || "Sin identificar";
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }

  const sources = rank(pageViews, (event) => event.source).slice(0, 5);
  const devices = rank(pageViews, (event) => event.device_type);
  const services = rank(
    events.filter((event) => event.event_type === "service_interest"),
    (event) => event.label || "Servicio",
  ).slice(0, 5);
  const dailyViews = Array.from({ length: 7 }, (_, index) => {
    const start = new Date(sevenDaysAgo.getTime() + index * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return {
      label: new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(start).replace(".", ""),
      value: pageViews.filter((event) => {
        const createdAt = new Date(event.created_at);
        return createdAt >= start && createdAt < end;
      }).length,
    };
  });
  const maxDaily = Math.max(...dailyViews.map((day) => day.value), 1);
  const maxSource = Math.max(...sources.map(([, value]) => value), 1);
  const maxDevice = Math.max(...devices.map(([, value]) => value), 1);

  return <>
    <PageTitle eyebrow="Uso del sitio" title="Estadísticas" text="Métricas privadas de los últimos 30 días, sin nombres, correos ni direcciones IP." action={<span className="connected-chip">● Sólo administradores</span>} />
    <div className="metric-grid analytics-metrics">
      <article><span>Visitas de hoy</span><strong>{todayViews}</strong><small>páginas vistas</small><i>24h</i></article>
      <article><span>Últimos 7 días</span><strong>{sevenDayViews}</strong><small>páginas vistas</small><i>7d</i></article>
      <article><span>Visitantes aproximados</span><strong>{approximateVisitors}</strong><small>sesiones en 30 días</small><i>≈</i></article>
      <article><span>Visitas acumuladas</span><strong>{totalViews}</strong><small>desde el inicio de la medición</small><i>∑</i></article>
    </div>
    <div className="analytics-grid">
      <section className="admin-card analytics-chart-card">
        <div className="admin-card-head"><div><h2>Evolución de visitas</h2><p>Últimos 7 días</p></div><span className="analytics-conversion">{whatsappClicks + budgetClicks} acciones comerciales</span></div>
        <div className="daily-chart" aria-label="Gráfico de visitas de los últimos siete días">
          {dailyViews.map((day) => <div key={day.label}><span><i style={{ height: `${Math.max((day.value / maxDaily) * 100, day.value ? 8 : 2)}%` }} /></span><b>{day.value}</b><small>{day.label}</small></div>)}
        </div>
      </section>
      <section className="admin-card analytics-actions-card">
        <div className="admin-card-head"><div><h2>Interés comercial</h2><p>Acciones registradas</p></div></div>
        <div className="analytics-action-list">
          <div><span>WhatsApp</span><strong>{whatsappClicks}</strong><small>clics</small></div>
          <div><span>Presupuesto / consulta</span><strong>{budgetClicks}</strong><small>clics</small></div>
          <div><span>Servicios consultados</span><strong>{services.reduce((sum, [, value]) => sum + value, 0)}</strong><small>intereses</small></div>
        </div>
      </section>
      <section className="admin-card analytics-list-card">
        <div className="admin-card-head"><div><h2>Origen de las visitas</h2><p>Google, Instagram, QR o acceso directo</p></div></div>
        <div className="ranked-list">
          {sources.length ? sources.map(([label, value]) => <div key={label}><span>{label}</span><b><i style={{ width: `${(value / maxSource) * 100}%` }} /></b><strong>{value}</strong></div>) : <EmptyState title="Sin visitas todavía" text="Los orígenes aparecerán cuando comiencen a llegar visitantes." />}
        </div>
      </section>
      <section className="admin-card analytics-list-card">
        <div className="admin-card-head"><div><h2>Dispositivos</h2><p>Cómo ingresan a MetroClima</p></div></div>
        <div className="ranked-list">
          {devices.length ? devices.map(([label, value]) => <div key={label}><span>{label}</span><b><i style={{ width: `${(value / maxDevice) * 100}%` }} /></b><strong>{value}</strong></div>) : <EmptyState title="Sin datos todavía" text="Se mostrarán celular, tablet y computadora." />}
        </div>
      </section>
      <section className="admin-card analytics-services-card">
        <div className="admin-card-head"><div><h2>Servicios más consultados</h2><p>Qué despierta mayor interés</p></div></div>
        {services.length ? <ol>{services.map(([label, value]) => <li key={label}><span>{label}</span><strong>{value}</strong></li>)}</ol> : <EmptyState title="Todavía sin consultas" text="Los servicios seleccionados aparecerán en este ranking." />}
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
  const [rubro, setRubro] = useState<"climatizacion" | "electricidad">("climatizacion");
  const [reviewToken, setReviewToken] = useState("");
  const [savedBudgetId, setSavedBudgetId] = useState("");
  const [savedBudgetNumber, setSavedBudgetNumber] = useState<number | null>(null);
  const [validity, setValidity] = useState(15);
  const [taxMode, setTaxMode] = useState("monotributo_iva_no_discriminado");
  const [paymentTerms, setPaymentTerms] = useState<string>(metroClima.paymentMethods);
  const [warrantyTerms, setWarrantyTerms] = useState<string>(metroClima.warranty);
  const [mode, setMode] = useState<BudgetMode>("simple");
  const [observations, setObservations] = useState("");
  const [renderFile, setRenderFile] = useState<File | null>(null);
  const [renderPreview, setRenderPreview] = useState("");
  const [labor, setLabor] = useState<Line[]>([{ id: 1, description: "Instalación estándar de equipo split", quantity: 1, unitPrice: 0 }]);
  const [materialLines, setMaterialLines] = useState<Line[]>([{ id: 2, description: "Kit de instalación", quantity: 1, unitPrice: 0 }]);
  const [highLabor, setHighLabor] = useState<Line[]>([{ id: 3, description: "Alternativa integral de instalación", quantity: 1, unitPrice: 0 }]);
  const [highMaterialLines, setHighMaterialLines] = useState<Line[]>([{ id: 4, description: "Materiales de alternativa integral", quantity: 1, unitPrice: 0 }]);
  const [saving, setSaving] = useState(false);
  const selectedClient = clients.find((item) => item.id === clientId);
  const reviewUrl = savedBudgetId && savedBudgetNumber
    ? `${metroClima.siteUrl}/experiencia?presupuesto=${savedBudgetId}&token=${reviewToken}&numero=${savedBudgetNumber}&rubro=${rubro}`
    : "";

  function startBudget() {
    setReviewToken(crypto.randomUUID());
    setSavedBudgetId("");
    setSavedBudgetNumber(null);
    setMode("simple");
    setObservations("");
    chooseRender(null);
    setBuilder(true);
  }

  function chooseRender(file: File | null) {
    if (renderPreview) URL.revokeObjectURL(renderPreview);
    setRenderFile(file);
    setRenderPreview(file ? URL.createObjectURL(file) : "");
  }

  const totals = useMemo(() => calculateBudgetTotals(labor, materialLines, taxMode), [labor, materialLines, taxMode]);
  const highTotals = useMemo(() => calculateBudgetTotals(highLabor, highMaterialLines, taxMode), [highLabor, highMaterialLines, taxMode]);

  function updateLine(option: "base" | "high", kind: "labor" | "materials", id: number, field: keyof Line, value: string) {
    const setter = option === "high"
      ? (kind === "labor" ? setHighLabor : setHighMaterialLines)
      : (kind === "labor" ? setLabor : setMaterialLines);
    setter((items) => items.map((item) => item.id === id ? { ...item, [field]: field === "description" ? value : Number(value) } : item));
  }
  function addLine(option: "base" | "high", kind: "labor" | "materials") {
    const line = { id: Date.now(), description: "", quantity: 1, unitPrice: 0 };
    const setter = option === "high"
      ? (kind === "labor" ? setHighLabor : setHighMaterialLines)
      : (kind === "labor" ? setLabor : setMaterialLines);
    setter((items) => [...items, line]);
  }
  function removeLine(option: "base" | "high", kind: "labor" | "materials", id: number) {
    const setter = option === "high"
      ? (kind === "labor" ? setHighLabor : setHighMaterialLines)
      : (kind === "labor" ? setLabor : setMaterialLines);
    setter((items) => items.filter((item) => item.id !== id));
  }

  async function saveBudget() {
    if (!clientId || !title.trim()) {
      await onRefresh("Completá el cliente y la descripción del trabajo.");
      return;
    }
    if (renderFile && renderFile.size > 10 * 1024 * 1024) {
      await onRefresh("El render supera los 10 MB. Elegí una imagen más liviana.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true);
    const { data, error } = await supabase.from("presupuestos").insert({
      cliente_id: clientId,
      titulo: title.trim(),
      rubro,
      modalidad: mode,
      observaciones: observations.trim() || null,
      review_token: reviewToken || crypto.randomUUID(),
      tratamiento_fiscal: taxMode,
      subtotal_mano_obra: totals.laborTotal,
      subtotal_materiales: totals.materialsTotal,
      iva: totals.tax,
      total: totals.total,
      subtotal_mano_obra_high: mode === "comparativo" ? highTotals.laborTotal : 0,
      subtotal_materiales_high: mode === "comparativo" ? highTotals.materialsTotal : 0,
      iva_high: mode === "comparativo" ? highTotals.tax : 0,
      total_high: mode === "comparativo" ? highTotals.total : 0,
      validez_dias: validity,
      condiciones_pago: paymentTerms,
      garantia: warrantyTerms,
      creado_por: userId,
      estado: "borrador",
    }).select("id,numero,review_token").single();
    if (error || !data) {
      setSaving(false);
      await onRefresh("No pudimos guardar el presupuesto.");
      return;
    }
    const items = [
      ...labor.filter((item) => item.description.trim()).map((item, order) => ({ presupuesto_id: data.id, alternativa: mode === "comparativo" ? "low" : "simple", tipo: "mano_obra", descripcion: item.description.trim(), cantidad: item.quantity, precio_unitario: item.unitPrice, orden: Number(order) })),
      ...materialLines.filter((item) => item.description.trim()).map((item, order) => ({ presupuesto_id: data.id, alternativa: mode === "comparativo" ? "low" : "simple", tipo: "material", descripcion: item.description.trim(), cantidad: item.quantity, precio_unitario: item.unitPrice, orden: labor.length + order })),
      ...(mode === "comparativo" ? highLabor.filter((item) => item.description.trim()).map((item, order) => ({ presupuesto_id: data.id, alternativa: "high", tipo: "mano_obra", descripcion: item.description.trim(), cantidad: item.quantity, precio_unitario: item.unitPrice, orden: Number(order) })) : []),
      ...(mode === "comparativo" ? highMaterialLines.filter((item) => item.description.trim()).map((item, order) => ({ presupuesto_id: data.id, alternativa: "high", tipo: "material", descripcion: item.description.trim(), cantidad: item.quantity, precio_unitario: item.unitPrice, orden: highLabor.length + order })) : []),
    ];
    const itemResult = items.length ? await supabase.from("items_presupuesto").insert(items) : { error: null };
    if (itemResult.error) {
      await supabase.from("presupuestos").delete().eq("id", data.id);
      setSaving(false);
      await onRefresh("No pudimos guardar los ítems del presupuesto.");
      return;
    }
    if (renderFile) {
      const extension = renderFile.type === "image/png" ? "png" : renderFile.type === "image/webp" ? "webp" : "jpg";
      const renderPath = `${data.id}/${crypto.randomUUID()}.${extension}`;
      const upload = await supabase.storage.from("presupuesto-renders").upload(renderPath, renderFile, { cacheControl: "3600", upsert: false });
      if (upload.error) {
        await supabase.from("presupuestos").delete().eq("id", data.id);
        setSaving(false);
        await onRefresh("No pudimos subir el render. El presupuesto no fue guardado.");
        return;
      }
      const linked = await supabase.from("presupuestos").update({ render_path: renderPath }).eq("id", data.id);
      if (linked.error) {
        await supabase.storage.from("presupuesto-renders").remove([renderPath]);
        await supabase.from("presupuestos").delete().eq("id", data.id);
        setSaving(false);
        await onRefresh("No pudimos vincular el render al presupuesto.");
        return;
      }
    }
    setSaving(false);
    setReviewToken(data.review_token);
    setSavedBudgetId(data.id);
    setSavedBudgetNumber(Number(data.numero));
    await onRefresh(`✓ Presupuesto${mode === "comparativo" ? " LOW / HIGH" : ""} guardado. Ya podés imprimirlo con su QR único.`);
  }

  async function updateBudgetState(id: string, estado: string) {
    const { error } = await getSupabaseBrowserClient()!.from("presupuestos").update({ estado }).eq("id", id);
    if (!error) await onRefresh("✓ Estado del presupuesto actualizado");
  }

  if (!builder) return <>
    <PageTitle eyebrow="Gestión comercial" title="Presupuestos" text="Un único documento conecta cliente, trabajo, imágenes y reseña." action={<button className="admin-primary" onClick={startBudget}>＋ Crear presupuesto</button>} />
    <section className="admin-card recent-budgets full-list">
      <div className="admin-card-head"><div><h2>Todos los presupuestos</h2><p>{budgets.length} documentos guardados</p></div><span className="connected-chip">● Datos en tiempo real</span></div>
      {budgets.length ? <div className="admin-table budgets-table"><div className="table-row table-head"><span>Número</span><span>Cliente</span><span>Trabajo</span><span>Rubro</span><span>Total</span><span>Estado</span><span>Reseña</span></div>{budgets.map((row) => <div className="table-row" key={row.id}><span>PRE-{new Date(row.creado_en).getFullYear()}-{String(row.numero).padStart(4, "0")}</span><span><b>{row.clientes?.nombre_razon_social || "Sin cliente"}</b></span><span>{row.titulo}{row.modalidad === "comparativo" && <small className="budget-comparison-chip">LOW / HIGH</small>}</span><span>{row.rubro === "electricidad" ? "Electricidad" : "Climatización"}</span><span><b>{row.modalidad === "comparativo" ? `${money.format(Number(row.total))} — ${money.format(Number(row.total_high))}` : money.format(Number(row.total))}</b></span><span><select className="status-select" value={row.estado} onChange={(event) => updateBudgetState(row.id, event.target.value)}><option value="borrador">Borrador</option><option value="enviado">Enviado</option><option value="aceptado">Aceptado</option><option value="rechazado">Rechazado</option><option value="vencido">Vencido</option></select></span><span><a className="table-action" href={`${metroClima.siteUrl}/experiencia?presupuesto=${row.id}&token=${row.review_token}&numero=${row.numero}&rubro=${row.rubro}`} target="_blank" rel="noreferrer">Abrir ↗</a></span></div>)}</div> : <EmptyState title="Todavía no hay presupuestos" text="Creá el primero y quedará conectado con su futuro trabajo y reseña." />}
    </section>
  </>;

  return <>
    <PageTitle eyebrow="Nuevo documento" title={savedBudgetNumber ? `Presupuesto PRE-${String(savedBudgetNumber).padStart(4, "0")}` : "Crear presupuesto"} text={savedBudgetNumber ? "Guardado y listo para imprimir con su enlace de experiencia." : "Completá los datos y revisá el documento membretado antes de guardarlo."} action={<button className="admin-secondary" onClick={() => { setBuilder(false); setTitle(""); }}>← Volver al listado</button>} />
    <div className="budget-builder-grid">
      <section className="admin-card budget-form">
        <div className="form-section-title"><span>01</span><div><h2>Cliente y trabajo</h2><p>Información principal del documento</p></div></div>
        <div className="form-row two"><label><span>Cliente</span><select value={clientId} onChange={(event) => setClientId(event.target.value)} required><option value="">Seleccionar cliente</option>{clients.map((client) => <option value={client.id} key={client.id}>{client.nombre_razon_social}</option>)}</select></label><label><span>Rubro</span><select value={rubro} onChange={(event) => setRubro(event.target.value as "climatizacion" | "electricidad")}><option value="climatizacion">Climatización</option><option value="electricidad">Electricidad</option></select></label></div>
        <label><span>Validez</span><select value={validity} onChange={(event) => setValidity(Number(event.target.value))}><option value={7}>7 días</option><option value={15}>15 días</option><option value={30}>30 días</option></select></label>
        {!clients.length && <p className="inline-warning">Primero cargá un cliente desde el módulo Clientes.</p>}
        <label><span>Trabajo / descripción general</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Instalación de equipo split en living" /></label>
        <div className="budget-mode-selector" role="group" aria-label="Tipo de presupuesto"><button type="button" className={mode === "simple" ? "active" : ""} onClick={() => setMode("simple")}><strong>Una propuesta</strong><span>Formato tradicional</span></button><button type="button" className={mode === "comparativo" ? "active" : ""} onClick={() => setMode("comparativo")}><strong>LOW + HIGH</strong><span>Dos alcances comparables</span></button></div>
        <div className={`budget-option-editor ${mode === "comparativo" ? "low" : "simple"}`}><div className="budget-option-heading"><span>{mode === "comparativo" ? "LOW" : "PROPUESTA"}</span><div><strong>{mode === "comparativo" ? "Alternativa esencial" : "Alcance del trabajo"}</strong><small>{mode === "comparativo" ? "La solución necesaria con una inversión cuidada." : "Servicios y materiales incluidos."}</small></div></div>
          <div className="form-section-title"><span>02</span><div><h2>Mano de obra</h2><p>Servicios realizados por MetroClima</p></div></div>
          <LineEditor kind="labor" lines={labor} onUpdate={(kind, id, field, value) => updateLine("base", kind, id, field, value)} onAdd={(kind) => addLine("base", kind)} onRemove={(kind, id) => removeLine("base", kind, id)} />
          <div className="form-section-title"><span>03</span><div><h2>Materiales</h2><p>Insumos separados del trabajo</p></div></div>
          <LineEditor kind="materials" lines={materialLines} onUpdate={(kind, id, field, value) => updateLine("base", kind, id, field, value)} onAdd={(kind) => addLine("base", kind)} onRemove={(kind, id) => removeLine("base", kind, id)} />
        </div>
        {mode === "comparativo" && <div className="budget-option-editor high"><div className="budget-option-heading"><span>HIGH</span><div><strong>Alternativa integral</strong><small>Mayor alcance, terminación o prestaciones.</small></div></div>
          <div className="form-section-title"><span>02</span><div><h2>Mano de obra HIGH</h2><p>Servicios incluidos en la opción integral</p></div></div>
          <LineEditor kind="labor" lines={highLabor} onUpdate={(kind, id, field, value) => updateLine("high", kind, id, field, value)} onAdd={(kind) => addLine("high", kind)} onRemove={(kind, id) => removeLine("high", kind, id)} />
          <div className="form-section-title"><span>03</span><div><h2>Materiales HIGH</h2><p>Insumos incluidos en la opción integral</p></div></div>
          <LineEditor kind="materials" lines={highMaterialLines} onUpdate={(kind, id, field, value) => updateLine("high", kind, id, field, value)} onAdd={(kind) => addLine("high", kind)} onRemove={(kind, id) => removeLine("high", kind, id)} />
        </div>}
        <div className="form-section-title"><span>04</span><div><h2>Tratamiento fiscal</h2><p>Configuración visible en el presupuesto</p></div></div>
        <label><span>Condición del emisor</span><select value={taxMode} onChange={(event) => setTaxMode(event.target.value)}><option value="monotributo_iva_no_discriminado">Monotributo · IVA no discriminado</option><option value="sin_impuesto_agregado">Presupuesto informativo · sin impuesto agregado</option><option value="responsable_inscripto_iva_21">Responsable inscripto · IVA 21% (futuro)</option></select></label>
        <div className="fiscal-note"><span>i</span><p>Con el régimen actual se prevé comprobante tipo C y el IVA no se discrimina. La alternativa del 21% queda preparada para un cambio futuro.</p></div>
        <div className="form-section-title"><span>05</span><div><h2>Condiciones comerciales</h2><p>Información visible para el cliente</p></div></div>
        <label><span>Condiciones de pago</span><input value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} /></label>
        <label><span>Garantía</span><input value={warrantyTerms} onChange={(event) => setWarrantyTerms(event.target.value)} /></label>
        <div className="form-section-title"><span>06</span><div><h2>Observaciones y render</h2><p>Información opcional visible en el documento</p></div></div>
        <label><span>Observaciones</span><textarea rows={5} maxLength={4000} value={observations} onChange={(event) => setObservations(event.target.value)} placeholder="Ej. El trabajo se coordinará fuera del horario comercial. No incluye tareas de albañilería." /></label>
        <label className="render-upload"><span>Render o imagen de referencia · opcional</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseRender(event.target.files?.[0] || null)} /><small>JPG, PNG o WebP · máximo 10 MB. Se incorpora al PDF del presupuesto.</small></label>
        {renderFile && <div className="render-file-chip"><span>✓ {renderFile.name}</span><button type="button" onClick={() => chooseRender(null)}>Quitar</button></div>}
        {savedBudgetNumber && <div className="saved-document-note"><span>✓</span><p><strong>Documento guardado</strong>El QR ya quedó vinculado a este presupuesto.</p></div>}
        <div className="builder-actions"><button type="button" onClick={() => window.print()} disabled={!savedBudgetNumber}>Imprimir / PDF</button><button className="admin-primary" onClick={saveBudget} disabled={saving || Boolean(savedBudgetNumber)}>{saving ? "Guardando…" : savedBudgetNumber ? "✓ Guardado" : "Guardar presupuesto"}</button></div>
      </section>
      <aside className="budget-preview">
        <div className="document-paper">
          <header><div className="document-brand"><img src="/metroclima-logo.png" alt="" /><div><strong>METROCLIMA</strong><small>Climatización + Electricidad</small></div></div><div><b>PRESUPUESTO</b><span>{savedBudgetNumber ? `PRE-${String(savedBudgetNumber).padStart(4, "0")}` : "NUEVO"}</span></div></header>
          <div className="document-meta"><div><small>CLIENTE</small><strong>{selectedClient?.nombre_razon_social || "Seleccionar cliente"}</strong><span>{selectedClient?.localidad || "Buenos Aires"}</span></div><div><small>FECHA</small><strong>{new Intl.DateTimeFormat("es-AR").format(new Date())}</strong><span>Válido por {validity} días</span></div></div>
          <h3>{title || "Descripción del trabajo"}</h3>
          {mode === "comparativo" ? <div className="document-options"><BudgetDocumentOption label="LOW" subtitle="Alternativa esencial" labor={labor} materials={materialLines} totals={totals} taxMode={taxMode} /><BudgetDocumentOption label="HIGH" subtitle="Alternativa integral" labor={highLabor} materials={highMaterialLines} totals={highTotals} taxMode={taxMode} /></div> : <BudgetDocumentOption labor={labor} materials={materialLines} totals={totals} taxMode={taxMode} />}
          {observations.trim() && <div className="document-observations"><small>OBSERVACIONES</small><p>{observations}</p></div>}
          {renderPreview && <figure className="document-render"><figcaption>VISTA PROPUESTA · IMAGEN DE REFERENCIA</figcaption><img src={renderPreview} alt="Render o imagen de referencia de la propuesta" /></figure>}
          <div className="document-conditions"><div><small>CONDICIONES DE PAGO</small><strong>{paymentTerms}</strong></div><div><small>GARANTÍA</small><strong>{warrantyTerms}</strong></div></div>
          {reviewUrl && <a className="document-review-qr" href={reviewUrl} target="_blank" rel="noreferrer">
            <QRCodeSVG value={reviewUrl} size={74} level="M" marginSize={1} title="QR para comentar el trabajo" />
            <span><small>AL FINALIZAR EL TRABAJO</small><strong>Escaneá o hacé clic acá para contarnos tu experiencia.</strong><em>Tu comentario se vincula únicamente con este presupuesto.</em></span>
          </a>}
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

function BudgetDocumentOption({ label, subtitle, labor, materials, totals, taxMode }: { label?: BudgetOption; subtitle?: string; labor: Line[]; materials: Line[]; totals: { laborTotal: number; materialsTotal: number; tax: number; total: number }; taxMode: string }) {
  return <section className={`document-option ${label ? `is-${label}` : "is-simple"}`}>
    {label && <div className="document-option-title"><span>{label.toUpperCase()}</span><strong>{subtitle}</strong></div>}
    <div className="document-section"><b>MANO DE OBRA</b>{labor.map((line) => <div key={line.id}><span>{line.description || "Sin descripción"}<small>{line.quantity} × {money.format(line.unitPrice)}</small></span><strong>{money.format(line.quantity * line.unitPrice)}</strong></div>)}</div>
    <div className="document-section"><b>MATERIALES</b>{materials.map((line) => <div key={line.id}><span>{line.description || "Sin descripción"}<small>{line.quantity} × {money.format(line.unitPrice)}</small></span><strong>{money.format(line.quantity * line.unitPrice)}</strong></div>)}</div>
    <div className="document-totals"><div><span>Mano de obra</span><b>{money.format(totals.laborTotal)}</b></div><div><span>Materiales</span><b>{money.format(totals.materialsTotal)}</b></div>{totals.tax > 0 && <div><span>IVA 21%</span><b>{money.format(totals.tax)}</b></div>}<div className="grand-total"><span>TOTAL {label?.toUpperCase()}</span><b>{money.format(totals.total)}</b></div><small>{taxMode === "monotributo_iva_no_discriminado" ? "IVA no discriminado · Comprobante tipo C" : taxMode === "responsable_inscripto_iva_21" ? "IVA discriminado al 21%" : "Sin impuesto agregado"}</small></div>
  </section>;
}

function Works({ works, reviews, budgets, userId, onRefresh }: { works: Work[]; reviews: CustomerReview[]; budgets: Budget[]; userId: string; onRefresh: (message?: string) => Promise<void> }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState("");
  const [publicTitle, setPublicTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const availableBudgets = budgets.filter((budget) => !works.some((work) => work.presupuesto_id === budget.id));
  const selectedBudget = budgets.find((budget) => budget.id === selectedBudgetId);
  const pendingReviews = reviews.filter((review) => !review.aprobada);

  function chooseBudget(id: string) {
    const budget = budgets.find((item) => item.id === id);
    setSelectedBudgetId(id);
    setPublicTitle(budget?.titulo ?? "");
  }

  async function uploadImages(workId: string, files: File[], startAt = 0, altTitle = publicTitle) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return "No hay conexión con el almacenamiento.";
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${workId}/${startAt + index + 1}-${crypto.randomUUID()}.${extension}`;
      const upload = await supabase.storage.from("trabajos").upload(path, file, { cacheControl: "31536000", upsert: false });
      if (upload.error) return `No pudimos subir ${file.name}.`;
      const metadata = await supabase.from("trabajo_imagenes").insert({
        trabajo_id: workId,
        storage_path: path,
        orden: startAt + index + 1,
        alt: `${altTitle || "Trabajo realizado por MetroClima"} · imagen ${startAt + index + 1}`,
      });
      if (metadata.error) {
        await supabase.storage.from("trabajos").remove([path]);
        return `La imagen ${file.name} no pudo vincularse al trabajo.`;
      }
    }
    return "";
  }

  async function createWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const photos = form.getAll("fotos").filter((entry): entry is File => entry instanceof File && entry.size > 0);
    if (!selectedBudgetId || photos.length < 1 || photos.length > 3) {
      await onRefresh("Elegí un presupuesto y cargá entre 1 y 3 imágenes.");
      return;
    }
    setSaving(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data, error } = await supabase.from("trabajos").insert({
      presupuesto_id: selectedBudgetId,
      titulo_publico: publicTitle.trim(),
      resumen: String(form.get("resumen") || "").trim(),
      localidad_publica: String(form.get("localidad") || "").trim() || null,
      fecha_realizacion: String(form.get("fecha") || "") || null,
      publicado: false,
      destacado: false,
      creado_por: userId,
    }).select("id").single();
    if (error || !data) {
      setSaving(false);
      await onRefresh("No pudimos crear el trabajo. Revisá los datos.");
      return;
    }
    const uploadError = await uploadImages(data.id, photos);
    setSaving(false);
    setShowForm(false);
    setSelectedBudgetId("");
    setPublicTitle("");
    await onRefresh(uploadError || "✓ Trabajo creado como borrador. Revisalo y publicalo cuando esté listo.");
  }

  async function addPhotos(work: Work, files: FileList | null) {
    const additions = files ? Array.from(files) : [];
    const current = work.trabajo_imagenes.length;
    if (!additions.length || current + additions.length > 3) {
      await onRefresh(`Este trabajo admite ${3 - current} imagen${3 - current === 1 ? "" : "es"} más.`);
      return;
    }
    const error = await uploadImages(work.id, additions, current, work.titulo_publico);
    await onRefresh(error || "✓ Imágenes agregadas al trabajo.");
  }

  async function deletePhoto(image: WorkImage) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const storageResult = await supabase.storage.from("trabajos").remove([image.storage_path]);
    if (storageResult.error) {
      await onRefresh("No pudimos eliminar la imagen del almacenamiento.");
      return;
    }
    const { error } = await supabase.from("trabajo_imagenes").delete().eq("id", image.id);
    if (!error) await onRefresh("✓ Imagen eliminada.");
  }

  async function togglePublication(work: Work) {
    if (!work.publicado && work.trabajo_imagenes.length === 0) {
      await onRefresh("Cargá al menos una imagen antes de publicar.");
      return;
    }
    const { error } = await getSupabaseBrowserClient()!.from("trabajos").update({ publicado: !work.publicado }).eq("id", work.id);
    if (!error) await onRefresh(work.publicado ? "✓ Trabajo ocultado del sitio." : "✓ Trabajo publicado en el book.");
  }

  async function toggleFeatured(work: Work) {
    const { error } = await getSupabaseBrowserClient()!.from("trabajos").update({ destacado: !work.destacado }).eq("id", work.id);
    if (!error) await onRefresh(work.destacado ? "✓ Trabajo quitado de destacados." : "✓ Trabajo destacado en la portada.");
  }

  async function moderateReview(review: CustomerReview, approved: boolean) {
    const { error } = await getSupabaseBrowserClient()!.from("resenas_clientes").update({
      aprobada: approved,
      moderada_por: userId,
      moderada_en: new Date().toISOString(),
    }).eq("id", review.id);
    if (!error) await onRefresh(approved ? "✓ Reseña aprobada para el book." : "✓ Reseña ocultada del sitio.");
  }

  function publicImage(path: string) {
    return getSupabaseBrowserClient()?.storage.from("trabajos").getPublicUrl(path).data.publicUrl ?? "";
  }

  async function copyReviewLink(work: Work) {
    if (!work.presupuestos) return;
    const { numero, rubro, review_token: token } = work.presupuestos;
    await navigator.clipboard.writeText(`${metroClima.siteUrl}/experiencia?presupuesto=${work.presupuesto_id}&token=${token}&numero=${numero}&rubro=${rubro}`);
    await onRefresh("✓ Enlace de experiencia copiado.");
  }

  return <>
    <PageTitle eyebrow="Contenido integrado" title="Trabajos y reseñas" text="Cada caso nace de un presupuesto: cliente, rubro, fotos y comentario quedan vinculados sin volver a cargar la misma información." action={<button className="admin-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "Cerrar" : "＋ Cargar trabajo"}</button>} />

    <div className="work-flow-strip"><span>01 Presupuesto</span><b>→</b><span>02 Trabajo + fotos</span><b>→</b><span>03 Reseña por QR</span><b>→</b><span>04 Publicación</span></div>

    {showForm && <form className="admin-card work-form" onSubmit={createWork}>
      <div className="admin-card-head"><div><h2>Nuevo trabajo documentado</h2><p>Elegí el presupuesto base; el cliente y el rubro se vinculan automáticamente.</p></div><span className="connected-chip">Máximo 3 fotos</span></div>
      <div className="form-row two">
        <label><span>Presupuesto relacionado</span><select value={selectedBudgetId} onChange={(event) => chooseBudget(event.target.value)} required><option value="">Seleccionar presupuesto</option>{availableBudgets.map((budget) => <option key={budget.id} value={budget.id}>PRE-{String(budget.numero).padStart(4, "0")} · {budget.clientes?.nombre_razon_social || "Sin cliente"} · {budget.titulo}</option>)}</select></label>
        <label><span>Rubro vinculado</span><input value={selectedBudget ? selectedBudget.rubro === "electricidad" ? "Electricidad" : "Climatización" : "Se completa desde el presupuesto"} disabled /></label>
      </div>
      {!availableBudgets.length && <p className="inline-warning">Todos los presupuestos ya tienen un trabajo asociado o todavía no hay presupuestos.</p>}
      <label><span>Título público</span><input value={publicTitle} onChange={(event) => setPublicTitle(event.target.value)} required minLength={6} maxLength={140} placeholder="Ej. Renovación eléctrica de local comercial" /></label>
      <label><span>Resumen del trabajo</span><textarea name="resumen" required minLength={20} maxLength={1200} rows={4} placeholder="Qué se encontró, qué se hizo y qué resultado obtuvo el cliente." /></label>
      <div className="form-row two"><label><span>Localidad pública (sin dirección)</span><input name="localidad" maxLength={100} placeholder="Ej. CABA" /></label><label><span>Fecha de realización</span><input name="fecha" type="date" /></label></div>
      <label className="photo-drop"><span>Imágenes reales del trabajo</span><input name="fotos" type="file" accept="image/jpeg,image/png,image/webp" multiple required /><small>Elegí entre 1 y 3 archivos JPG, PNG o WebP. Máximo 8 MB por imagen.</small></label>
      <button className="admin-primary" disabled={saving || !availableBudgets.length}>{saving ? "Creando y subiendo…" : "Crear trabajo como borrador"}</button>
    </form>}

    <div className="works-admin-grid">
      <section className="admin-card works-library">
        <div className="admin-card-head"><div><h2>Book de trabajos</h2><p>{works.length} casos vinculados</p></div><Link href="/trabajos" target="_blank">Ver página pública ↗</Link></div>
        {works.length ? <div className="work-admin-list">{works.map((work) => <article key={work.id}>
          <div className="work-thumb-strip">{[...work.trabajo_imagenes].sort((a, b) => a.orden - b.orden).map((image) => <figure key={image.id}><img src={publicImage(image.storage_path)} alt={image.alt} /><button onClick={() => deletePhoto(image)} aria-label="Eliminar imagen">×</button></figure>)}{work.trabajo_imagenes.length < 3 && <label className="add-work-photo">＋<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => addPhotos(work, event.target.files)} /></label>}</div>
          <div className="work-admin-copy"><div><span>{work.presupuestos?.rubro === "electricidad" ? "Electricidad" : "Climatización"}</span><Status value={work.publicado ? "Publicado" : "Borrador"} /></div><h3>{work.titulo_publico}</h3><p>{work.resumen}</p><small>PRE-{String(work.presupuestos?.numero ?? 0).padStart(4, "0")} · {work.presupuestos?.clientes?.nombre_razon_social || "Cliente"}</small></div>
          <div className="work-admin-actions"><button onClick={() => togglePublication(work)}>{work.publicado ? "Ocultar" : "Publicar"}</button><button onClick={() => toggleFeatured(work)}>{work.destacado ? "Quitar destacado" : "Destacar"}</button>{work.presupuestos?.review_token && <button onClick={() => copyReviewLink(work)}>Copiar enlace QR</button>}</div>
        </article>)}</div> : <EmptyState title="Todavía no hay trabajos cargados" text="Creá un presupuesto y usalo como base para subir las primeras fotos reales." />}
      </section>

      <section className="admin-card review-inbox">
        <div className="admin-card-head"><div><h2>Reseñas de clientes</h2><p>{pendingReviews.length} pendientes de revisión</p></div><span className="connected-chip">No se publican solas</span></div>
        {reviews.length ? <div className="review-admin-list">{reviews.map((review) => <article key={review.id}>
          <div><span>{"★".repeat(review.puntuacion)}{"☆".repeat(5 - review.puntuacion)}</span><Status value={review.aprobada ? "Publicada" : "Pendiente"} /></div>
          <blockquote>“{review.comentario}”</blockquote>
          <p><strong>{review.nombre_publico}</strong><small>PRE-{String(review.presupuestos?.numero ?? 0).padStart(4, "0")} · {review.presupuestos?.titulo}</small></p>
          <button onClick={() => moderateReview(review, !review.aprobada)}>{review.aprobada ? "Ocultar reseña" : "Aprobar y publicar"}</button>
        </article>)}</div> : <EmptyState title="Todavía no llegaron reseñas" text="El cliente puede enviarla desde el QR o el enlace clickeable de su presupuesto." />}
      </section>
    </div>
  </>;
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
    {hasSupabaseConfig && <PasskeyManager />}
  </>;
}

function PasskeyManager() {
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadPasskeys() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data, error } = await supabase.auth.passkey.list();
    if (!error) setPasskeys((data ?? []) as PasskeyRecord[]);
  }

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.passkey.list().then(({ data, error }) => {
      if (mounted && !error) setPasskeys((data ?? []) as PasskeyRecord[]);
    });
    return () => { mounted = false; };
  }, []);

  async function registerPasskey() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true);
    setStatus("");
    const { data, error } = await supabase.auth.registerPasskey();
    setSaving(false);
    if (error) {
      setStatus(
        error.code === "passkey_disabled"
          ? "Primero hay que habilitar Passkeys en Supabase para metroclimaa.com.ar."
          : "No se pudo registrar la passkey. Podés volver a intentarlo.",
      );
      return;
    }
    setStatus(`✓ ${data.friendly_name || "Passkey"} registrada correctamente.`);
    await loadPasskeys();
  }

  async function deletePasskey(passkeyId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.auth.passkey.delete({ passkeyId });
    if (!error) {
      setStatus("✓ Passkey eliminada.");
      await loadPasskeys();
    }
  }

  return <section className="admin-card passkey-security-card">
    <div className="passkey-security-copy">
      <span className="passkey-security-icon">◎</span>
      <div><h2>Acceso biométrico</h2><p>Registrá este dispositivo para ingresar con Face ID, huella o PIN sin escribir la contraseña.</p></div>
      <button className="admin-primary" onClick={registerPasskey} disabled={saving}>{saving ? "Registrando…" : "＋ Registrar dispositivo"}</button>
    </div>
    {status && <p className="passkey-status" role="status">{status}</p>}
    {passkeys.length > 0 && <div className="passkey-list">
      {passkeys.map((passkey) => <div key={passkey.id}>
        <span>✓</span>
        <div><strong>{passkey.friendly_name || "Passkey"}</strong><small>Creada el {shortDate.format(new Date(passkey.created_at))}{passkey.last_used_at ? ` · Último uso ${shortDate.format(new Date(passkey.last_used_at))}` : ""}</small></div>
        <button onClick={() => deletePasskey(passkey.id)}>Eliminar</button>
      </div>)}
    </div>}
  </section>;
}
