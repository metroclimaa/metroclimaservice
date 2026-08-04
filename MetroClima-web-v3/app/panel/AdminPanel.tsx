"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { metroClima } from "@/lib/metroclima";

type Tab = "resumen" | "consultas" | "presupuestos" | "comprobantes" | "clientes" | "materiales";
type Line = { id: number; description: string; quantity: number; unitPrice: number };

const navItems: { id: Tab; label: string; mark: string; count?: number }[] = [
  { id: "resumen", label: "Resumen", mark: "⌂" },
  { id: "consultas", label: "Consultas", mark: "?", count: 4 },
  { id: "presupuestos", label: "Presupuestos", mark: "$" },
  { id: "comprobantes", label: "Comprobantes", mark: "▤" },
  { id: "clientes", label: "Clientes", mark: "◎" },
  { id: "materiales", label: "Materiales", mark: "◇" },
];

const adminQuestions = [
  { initials: "MG", name: "Mariana Gómez", title: "Potencia para un living de 30 m²", area: "Avellaneda", contact: "11 3284 6190", status: "Nueva", time: "Hace 24 min" },
  { initials: "FL", name: "Federico López", title: "Reutilizar cañería de un equipo viejo", area: "Caballito", contact: "fede.lopez@email.com", status: "Nueva", time: "Hace 2 h" },
  { initials: "SE", name: "Santiago E.", title: "Mantenimiento de 4 equipos en oficina", area: "Microcentro", contact: "11 5130 8821", status: "En seguimiento", time: "Ayer" },
  { initials: "AR", name: "Ana Rivas", title: "Instalación split en dormitorio", area: "Quilmes", contact: "11 4002 1497", status: "Presupuestada", time: "02 ago" },
];

const budgetRows = [
  { code: "PRE-2026-018", client: "Ana Rivas", service: "Instalación split 3.000 fg", total: "$ 248.000", status: "Enviado", date: "02 ago" },
  { code: "PRE-2026-017", client: "Estudio Vega", service: "Mantenimiento · 4 equipos", total: "$ 360.000", status: "Aceptado", date: "30 jul" },
  { code: "PRE-2026-016", client: "Martín Acosta", service: "Reubicación de unidad exterior", total: "$ 185.500", status: "Borrador", date: "28 jul" },
];

const invoiceRows = [
  { code: "FC C 00002-00000021", client: "Estudio Vega", date: "01 ago 2026", total: "$ 360.000", status: "Emitida" },
  { code: "FC C 00002-00000020", client: "Laura Méndez", date: "27 jul 2026", total: "$ 196.000", status: "Emitida" },
  { code: "Recibo RC-2026-014", client: "Martín Acosta", date: "24 jul 2026", total: "$ 95.000", status: "Cobrado" },
];

const materials = [
  { name: "Caño de cobre 1/4\"", unit: "metro", reference: "$ 9.800", minimum: "20 m", status: "Catálogo" },
  { name: "Caño de cobre 3/8\"", unit: "metro", reference: "$ 13.400", minimum: "20 m", status: "Catálogo" },
  { name: "Cable taller 5 × 1,5 mm²", unit: "metro", reference: "$ 3.750", minimum: "30 m", status: "Catálogo" },
  { name: "Ménsula reforzada 450 mm", unit: "juego", reference: "$ 22.600", minimum: "4 u", status: "Catálogo" },
  { name: "Manguera de drenaje", unit: "metro", reference: "$ 1.950", minimum: "25 m", status: "Catálogo" },
];

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

function Status({ children }: { children: string }) {
  return <span className={`admin-status status-${children.toLocaleLowerCase("es").replaceAll(" ", "-")}`}>{children}</span>;
}

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>("resumen");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [taxMode, setTaxMode] = useState("monotributo");
  const [paymentTerms, setPaymentTerms] = useState(metroClima.paymentMethods);
  const [warrantyTerms, setWarrantyTerms] = useState(metroClima.warranty);
  const [labor, setLabor] = useState<Line[]>([
    { id: 1, description: "Instalación estándar de equipo split", quantity: 1, unitPrice: 145000 },
  ]);
  const [materialLines, setMaterialLines] = useState<Line[]>([
    { id: 2, description: "Kit de instalación hasta 3 metros", quantity: 1, unitPrice: 92000 },
  ]);

  const totals = useMemo(() => {
    const laborTotal = labor.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const materialsTotal = materialLines.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const subtotal = laborTotal + materialsTotal;
    const tax = taxMode === "iva21" ? subtotal * 0.21 : 0;
    return { laborTotal, materialsTotal, subtotal, tax, total: subtotal + tax };
  }, [labor, materialLines, taxMode]);

  function selectTab(next: Tab) {
    setTab(next);
    setMenuOpen(false);
    setNotice("");
  }

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

  return (
    <main className={`admin-layout ${menuOpen ? "menu-open" : ""}`}>
      <aside className="admin-sidebar">
        <Link className="brand admin-brand" href="/">
          <span className="brand-mark"><img src="/metroclima-logo.png" alt="" /></span>
          <span className="brand-copy"><strong>METRO<span>CLIMA</span></strong><small>Panel de gestión</small></span>
        </Link>
        <nav>
          <p>Principal</p>
          {navItems.slice(0, 4).map((item) => <button key={item.id} className={tab === item.id ? "is-active" : ""} onClick={() => selectTab(item.id)}><span>{item.mark}</span>{item.label}{item.count && <b>{item.count}</b>}</button>)}
          <p>Organización</p>
          {navItems.slice(4).map((item) => <button key={item.id} className={tab === item.id ? "is-active" : ""} onClick={() => selectTab(item.id)}><span>{item.mark}</span>{item.label}</button>)}
        </nav>
        <div className="admin-user">
          <span>N</span><div><strong>Nicolás</strong><small>Administrador</small></div><button aria-label="Opciones">⋯</button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir navegación">☰</button>
          <div className="admin-private"><span></span> Área privada</div>
          <div className="admin-top-actions"><button aria-label="Notificaciones">♢<b>4</b></button><Link href="/" target="_blank">Ver sitio ↗</Link></div>
        </header>

        <div className="admin-content">
          {tab === "resumen" && <Dashboard onNavigate={selectTab} />}
          {tab === "consultas" && <Questions />}
          {tab === "presupuestos" && <Budgets labor={labor} materials={materialLines} totals={totals} taxMode={taxMode} paymentTerms={paymentTerms} warrantyTerms={warrantyTerms} onTaxMode={setTaxMode} onPaymentTerms={setPaymentTerms} onWarrantyTerms={setWarrantyTerms} onUpdate={updateLine} onAdd={addLine} onRemove={removeLine} onNotice={setNotice} />}
          {tab === "comprobantes" && <Invoices />}
          {tab === "clientes" && <Clients />}
          {tab === "materiales" && <Materials />}
          {notice && <div className="admin-toast" role="status">✓ {notice}<button onClick={() => setNotice("")}>×</button></div>}
        </div>
      </section>
      {menuOpen && <button className="admin-overlay" aria-label="Cerrar navegación" onClick={() => setMenuOpen(false)} />}
    </main>
  );
}

function PageTitle({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: React.ReactNode }) {
  return <div className="admin-page-title"><div><span>{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{action}</div>;
}

function Dashboard({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  return <>
    <PageTitle eyebrow="Martes, 4 de agosto" title="Buen día, Nicolás." text="Este es el estado general de MetroClima." action={<button className="admin-primary" onClick={() => onNavigate("presupuestos")}>＋ Nuevo presupuesto</button>} />
    <div className="metric-grid">
      <article><span>Consultas nuevas</span><strong>4</strong><small><b>+2</b> desde ayer</small><i>?</i></article>
      <article><span>Presupuestos abiertos</span><strong>6</strong><small>$ 1.284.500 potenciales</small><i>$</i></article>
      <article><span>Trabajos confirmados</span><strong>3</strong><small>Próximos 7 días</small><i>✓</i></article>
      <article><span>Facturación del mes</span><strong>$ 556k</strong><small><b>+18%</b> vs. mes anterior</small><i>▤</i></article>
    </div>
    <div className="admin-dashboard-grid">
      <section className="admin-card attention-card">
        <div className="admin-card-head"><div><h2>Requieren atención</h2><p>Consultas y tareas pendientes</p></div><button onClick={() => onNavigate("consultas")}>Ver todas →</button></div>
        <div className="attention-list">
          {adminQuestions.slice(0, 3).map((item, index) => <button key={item.title} onClick={() => onNavigate("consultas")}><span className={`avatar avatar-${index}`}>{item.initials}</span><div><strong>{item.title}</strong><small>{item.name} · {item.area}</small></div><time>{item.time}</time><b>›</b></button>)}
        </div>
      </section>
      <section className="admin-card agenda-card">
        <div className="admin-card-head"><div><h2>Próximos trabajos</h2><p>Agenda coordinada</p></div><button>Ver agenda →</button></div>
        <div className="agenda-date"><strong>06</strong><span>AGO<small>Jueves</small></span><div><b>09:00</b><p>Instalación split · Ana Rivas</p><small>Quilmes · Nicolás + Cristian</small></div></div>
        <div className="agenda-date"><strong>08</strong><span>AGO<small>Sábado</small></span><div><b>08:30</b><p>Mantenimiento · Estudio Vega</p><small>Microcentro · 4 equipos</small></div></div>
      </section>
    </div>
    <section className="admin-card recent-budgets">
      <div className="admin-card-head"><div><h2>Presupuestos recientes</h2><p>Últimos movimientos comerciales</p></div><button onClick={() => onNavigate("presupuestos")}>Gestionar →</button></div>
      <div className="admin-table"><div className="table-row table-head"><span>Número</span><span>Cliente</span><span>Trabajo</span><span>Total</span><span>Estado</span><span></span></div>{budgetRows.map((row) => <div className="table-row" key={row.code}><span>{row.code}</span><span><b>{row.client}</b></span><span>{row.service}</span><span><b>{row.total}</b></span><span><Status>{row.status}</Status></span><span>⋯</span></div>)}</div>
    </section>
  </>;
}

function Questions() {
  return <>
    <PageTitle eyebrow="Atención comercial" title="Consultas" text="Respondé el foro y usá los datos privados sólo cuando la persona pidió ser contactada." action={<div className="admin-filter"><button className="is-active">Pendientes 4</button><button>Respondidas</button><button>Todas</button></div>} />
    <div className="questions-admin-grid">
      <section className="admin-card admin-inbox">
        {adminQuestions.map((item, index) => <button key={item.title} className={index === 0 ? "is-selected" : ""}><span className={`avatar avatar-${index}`}>{item.initials}</span><div><strong>{item.title}</strong><p>{item.name} · {item.area}</p><small>{item.time}</small></div><Status>{item.status}</Status></button>)}
      </section>
      <section className="admin-card question-detail">
        <div className="detail-head"><span className="avatar avatar-0">MG</span><div><h2>Potencia para un living de 30 m²</h2><p>Mariana Gómez · Publicada hace 24 minutos</p></div><Status>Nueva</Status></div>
        <span className="category-pill">Elección del equipo</span>
        <blockquote>“El living tiene un ventanal grande y recibe sol durante la tarde. ¿Alcanza con un equipo de 3.000 frigorías?”</blockquote>
        <div className="private-contact-box"><div><span>Datos privados</span><strong>Solicitó ser contactada</strong></div><p><b>Teléfono</b> 11 3284 6190</p><p><b>Correo</b> mariana.gomez@email.com</p><p><b>Zona</b> Avellaneda</p></div>
        <label className="reply-box"><span>Respuesta pública</span><textarea rows={5} defaultValue="Los metros cuadrados sirven como base, pero el ventanal y la orientación pueden aumentar la carga térmica. Para recomendarte bien conviene revisar altura, superficie vidriada y aislación." /></label>
        <div className="detail-actions"><button>Guardar borrador</button><button className="admin-primary">Publicar respuesta</button></div>
      </section>
    </div>
  </>;
}

type BudgetProps = {
  labor: Line[];
  materials: Line[];
  totals: { laborTotal: number; materialsTotal: number; subtotal: number; tax: number; total: number };
  taxMode: string;
  paymentTerms: string;
  warrantyTerms: string;
  onTaxMode: (value: string) => void;
  onPaymentTerms: (value: string) => void;
  onWarrantyTerms: (value: string) => void;
  onUpdate: (kind: "labor" | "materials", id: number, field: keyof Line, value: string) => void;
  onAdd: (kind: "labor" | "materials") => void;
  onRemove: (kind: "labor" | "materials", id: number) => void;
  onNotice: (message: string) => void;
};

function Budgets({ labor, materials, totals, taxMode, paymentTerms, warrantyTerms, onTaxMode, onPaymentTerms, onWarrantyTerms, onUpdate, onAdd, onRemove, onNotice }: BudgetProps) {
  const [builder, setBuilder] = useState(false);
  if (!builder) return <>
    <PageTitle eyebrow="Gestión comercial" title="Presupuestos" text="Mano de obra y materiales separados, con el tratamiento fiscal correcto para cada caso." action={<button className="admin-primary" onClick={() => setBuilder(true)}>＋ Crear presupuesto</button>} />
    <section className="admin-card recent-budgets full-list">
      <div className="admin-card-head"><div><h2>Todos los presupuestos</h2><p>3 documentos en esta vista</p></div><div className="admin-filter"><button className="is-active">Todos</button><button>Abiertos</button><button>Aceptados</button></div></div>
      <div className="admin-table"><div className="table-row table-head"><span>Número</span><span>Cliente</span><span>Trabajo</span><span>Total</span><span>Estado</span><span>Fecha</span></div>{budgetRows.map((row) => <div className="table-row" key={row.code}><span>{row.code}</span><span><b>{row.client}</b></span><span>{row.service}</span><span><b>{row.total}</b></span><span><Status>{row.status}</Status></span><span>{row.date}</span></div>)}</div>
    </section>
  </>;

  return <>
    <PageTitle eyebrow="Nuevo documento" title="Crear presupuesto" text="Completá los datos y revisá el documento membretado antes de enviarlo." action={<button className="admin-secondary" onClick={() => setBuilder(false)}>← Volver al listado</button>} />
    <div className="budget-builder-grid">
      <section className="admin-card budget-form">
        <div className="form-section-title"><span>01</span><div><h2>Cliente y trabajo</h2><p>Información principal del documento</p></div></div>
        <div className="form-row two"><label><span>Cliente</span><input defaultValue="Mariana Gómez" /></label><label><span>Validez</span><select defaultValue="15"><option value="7">7 días</option><option value="15">15 días</option><option value="30">30 días</option></select></label></div>
        <label><span>Trabajo / descripción general</span><input defaultValue="Instalación de equipo split en living" /></label>
        <div className="form-section-title"><span>02</span><div><h2>Mano de obra</h2><p>Servicios realizados por MetroClima</p></div></div>
        <LineEditor kind="labor" lines={labor} onUpdate={onUpdate} onAdd={onAdd} onRemove={onRemove} />
        <div className="form-section-title"><span>03</span><div><h2>Materiales</h2><p>Insumos separados del trabajo</p></div></div>
        <LineEditor kind="materials" lines={materials} onUpdate={onUpdate} onAdd={onAdd} onRemove={onRemove} />
        <div className="form-section-title"><span>04</span><div><h2>Tratamiento fiscal</h2><p>Configuración visible en el presupuesto</p></div></div>
        <label><span>Condición del emisor</span><select value={taxMode} onChange={(event) => onTaxMode(event.target.value)}><option value="monotributo">Monotributo · IVA no discriminado</option><option value="sin-iva">Presupuesto informativo · sin impuesto agregado</option><option value="iva21">Responsable inscripto · IVA 21% (futuro)</option></select></label>
        <div className="fiscal-note"><span>i</span><p>Para MetroClima como monotributista, el comprobante previsto es tipo C y el IVA no se discrimina. La opción del 21% queda preparada sólo para un eventual cambio de régimen.</p></div>
        <div className="form-section-title"><span>05</span><div><h2>Condiciones comerciales</h2><p>Información visible para el cliente</p></div></div>
        <label><span>Condiciones de pago</span><input value={paymentTerms} onChange={(event) => onPaymentTerms(event.target.value)} /></label>
        <label><span>Garantía</span><input value={warrantyTerms} onChange={(event) => onWarrantyTerms(event.target.value)} /></label>
        <div className="builder-actions"><button>Guardar borrador</button><button className="admin-primary" onClick={() => onNotice("Presupuesto preparado para exportar y enviar")}>Generar presupuesto</button></div>
      </section>
      <aside className="budget-preview">
        <div className="document-paper">
          <header><div className="document-brand"><img src="/metroclima-logo.png" alt="" /><div><strong>METROCLIMA</strong><small>Climatización profesional</small></div></div><div><b>PRESUPUESTO</b><span>PRE-2026-019</span></div></header>
          <div className="document-meta"><div><small>CLIENTE</small><strong>Mariana Gómez</strong><span>Avellaneda, Buenos Aires</span></div><div><small>FECHA</small><strong>04/08/2026</strong><span>Válido por 15 días</span></div></div>
          <h3>Instalación de equipo split en living</h3>
          <div className="document-section"><b>MANO DE OBRA</b>{labor.map((line) => <div key={line.id}><span>{line.description || "Sin descripción"}<small>{line.quantity} × {money.format(line.unitPrice)}</small></span><strong>{money.format(line.quantity * line.unitPrice)}</strong></div>)}</div>
          <div className="document-section"><b>MATERIALES</b>{materials.map((line) => <div key={line.id}><span>{line.description || "Sin descripción"}<small>{line.quantity} × {money.format(line.unitPrice)}</small></span><strong>{money.format(line.quantity * line.unitPrice)}</strong></div>)}</div>
          <div className="document-totals"><div><span>Mano de obra</span><b>{money.format(totals.laborTotal)}</b></div><div><span>Materiales</span><b>{money.format(totals.materialsTotal)}</b></div>{totals.tax > 0 && <div><span>IVA 21%</span><b>{money.format(totals.tax)}</b></div>}<div className="grand-total"><span>TOTAL</span><b>{money.format(totals.total)}</b></div><small>{taxMode === "monotributo" ? "IVA no discriminado · Comprobante tipo C" : taxMode === "iva21" ? "IVA discriminado al 21%" : "Sin impuesto agregado en esta cotización"}</small></div>
          <div className="document-conditions"><div><small>CONDICIONES DE PAGO</small><strong>{paymentTerms}</strong></div><div><small>GARANTÍA</small><strong>{warrantyTerms}</strong></div></div>
          <footer><div><small>RESPONSABLES</small><strong>Cristian · Nicolás</strong></div><div><small>CONTACTO</small><strong>WhatsApp · {metroClima.whatsapp[0].display} / {metroClima.whatsapp[1].display}</strong></div></footer>
        </div>
        <p>Vista previa del documento · Se exportará en PDF con este membrete.</p>
      </aside>
    </div>
  </>;
}

function LineEditor({ kind, lines, onUpdate, onAdd, onRemove }: { kind: "labor" | "materials"; lines: Line[]; onUpdate: BudgetProps["onUpdate"]; onAdd: BudgetProps["onAdd"]; onRemove: BudgetProps["onRemove"] }) {
  return <div className="line-editor"><div className="line-head"><span>Descripción</span><span>Cant.</span><span>Precio unit.</span><span>Total</span><span></span></div>{lines.map((line) => <div className="line-row" key={line.id}><input value={line.description} onChange={(event) => onUpdate(kind, line.id, "description", event.target.value)} placeholder="Descripción" /><input type="number" min="1" value={line.quantity} onChange={(event) => onUpdate(kind, line.id, "quantity", event.target.value)} /><input type="number" min="0" value={line.unitPrice} onChange={(event) => onUpdate(kind, line.id, "unitPrice", event.target.value)} /><b>{money.format(line.quantity * line.unitPrice)}</b><button onClick={() => onRemove(kind, line.id)} aria-label="Eliminar ítem">×</button></div>)}<button className="add-line" onClick={() => onAdd(kind)}>＋ Agregar ítem</button></div>;
}

function Invoices() {
  return <>
    <PageTitle eyebrow="Documentación fiscal" title="Comprobantes" text="Facturas y recibos vinculados a cada trabajo y cliente." action={<button className="admin-primary">＋ Nuevo comprobante</button>} />
    <div className="arca-banner"><div><span>ARCA</span><p><strong>Integración preparada, todavía no activada</strong>La emisión automática se habilitará al completar CUIT, domicilio fiscal, certificado, clave privada y punto de venta de cada responsable.</p></div><button>Ver configuración</button></div>
    <section className="admin-card recent-budgets full-list"><div className="admin-card-head"><div><h2>Comprobantes recientes</h2><p>Régimen actual configurado: Monotributo</p></div><Status>Factura C</Status></div><div className="admin-table invoices-table"><div className="table-row table-head"><span>Comprobante</span><span>Cliente</span><span>Fecha</span><span>Total</span><span>Estado</span><span></span></div>{invoiceRows.map((row) => <div className="table-row" key={row.code}><span><b>{row.code}</b></span><span>{row.client}</span><span>{row.date}</span><span><b>{row.total}</b></span><span><Status>{row.status}</Status></span><span>Descargar ↓</span></div>)}</div></section>
  </>;
}

function Clients() {
  return <><PageTitle eyebrow="Base comercial" title="Clientes" text="Historial de consultas, presupuestos, trabajos y comprobantes por persona o empresa." action={<button className="admin-primary">＋ Nuevo cliente</button>} /><div className="client-grid">{["Mariana Gómez", "Estudio Vega", "Ana Rivas", "Martín Acosta"].map((name, index) => <article className="admin-card client-card" key={name}><span className={`avatar avatar-${index}`}>{name.split(" ").map((word) => word[0]).join("")}</span><div><h2>{name}</h2><p>{index === 1 ? "Empresa · Microcentro" : ["Avellaneda", "Microcentro", "Quilmes", "Lanús"][index]}</p></div><dl><div><dt>Presupuestos</dt><dd>{index + 1}</dd></div><div><dt>Trabajos</dt><dd>{Math.max(1, index)}</dd></div></dl><button>Ver ficha →</button></article>)}</div></>;
}

function Materials() {
  return <><PageTitle eyebrow="Preparado para crecer" title="Materiales" text="Catálogo de insumos con precios de referencia. El control de stock puede activarse cuando empiecen a manejar existencias." action={<button className="admin-primary">＋ Agregar material</button>} /><div className="future-stock-banner"><span>◇</span><div><strong>Modo catálogo activo</strong><p>Hoy podés usar estos materiales al presupuestar. Más adelante se habilitan entradas, salidas, stock mínimo y alertas de reposición.</p></div><button>Configurar stock futuro</button></div><section className="admin-card materials-table"><div className="admin-table"><div className="table-row table-head"><span>Material</span><span>Unidad</span><span>Precio ref.</span><span>Stock mínimo futuro</span><span>Estado</span><span></span></div>{materials.map((item) => <div className="table-row" key={item.name}><span><b>{item.name}</b></span><span>{item.unit}</span><span>{item.reference}</span><span>{item.minimum}</span><span><Status>{item.status}</Status></span><span>⋯</span></div>)}</div></section></>;
}
