import Link from "next/link";
import { PortfolioShowcase } from "@/components/PortfolioShowcase";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export type ServiceLandingConfig = {
  kind: "climatizacion" | "electricidad";
  eyebrow: string;
  title: string;
  accent: string;
  lead: string;
  assurance: string;
  services: {
    number: string;
    title: string;
    text: string;
    image?: string;
    alt?: string;
  }[];
};

export function ServiceLanding({ config }: { config: ServiceLandingConfig }) {
  const isElectric = config.kind === "electricidad";
  return <main className={`service-landing ${isElectric ? "electric-landing" : "climate-landing"}`}>
    <SiteHeader active={config.kind} />

    <section className="specialty-hero">
      <div className="specialty-hero-media" aria-hidden="true">
        {isElectric && <div className="electric-board">
          <span className="electric-line line-a"></span>
          <span className="electric-line line-b"></span>
          <span className="electric-line line-c"></span>
          <div className="electric-module"><i></i><i></i><i></i><b>ON</b></div>
          <div className="electric-reading"><small>INSTALACIÓN</small><strong>SEGURA</strong><span>VERIFICADA</span></div>
        </div>}
      </div>
      <div className="specialty-hero-shade" aria-hidden="true"></div>
      <div className="shell specialty-hero-copy">
        <p className="eyebrow light"><span></span> {config.eyebrow}</p>
        <h1>{config.title}<br /><em>{config.accent}</em></h1>
        <p>{config.lead}</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/consultas#nueva-consulta" data-analytics-event="budget_click" data-analytics-label={`hero-${config.kind}`}>Solicitar presupuesto <span>→</span></Link>
          <a className="button button-ghost" href="#especialidad">Ver trabajos incluidos</a>
        </div>
        <div className="hero-trust">
          <span><b>✓</b> {config.assurance}</span>
          <span><b>✓</b> Seguros vigentes</span>
          <span><b>✓</b> Garantía</span>
        </div>
      </div>
    </section>

    <section className="specialty-intro" id="especialidad">
      <div className="shell specialty-intro-grid">
        <div>
          <p className="eyebrow"><span></span> {isElectric ? "Electricidad profesional" : "Climatización profesional"}</p>
          <h2>{isElectric ? "Seguridad que no se improvisa." : "Confort pensado como sistema."}</h2>
        </div>
        <p>{isElectric
          ? "Diseñamos, adecuamos y diagnosticamos instalaciones eléctricas con foco en protecciones, orden, capacidad y continuidad. Cada intervención se planifica para el uso real del espacio."
          : "No se trata sólo de colocar un equipo. Evaluamos capacidad, ubicación, alimentación, drenaje, circulación de aire y uso para lograr rendimiento y una instalación cuidada."}</p>
      </div>
    </section>

    <section className="specialty-services">
      <div className="shell specialty-service-grid">
        {config.services.map((service) => <article className="specialty-card" key={service.number}>
          {service.image ? <div className="specialty-card-image"><img src={service.image} alt={service.alt ?? ""} loading="lazy" /></div> : <div className="electric-card-visual" aria-hidden="true"><span>{service.number}</span><i></i><i></i><i></i></div>}
          <div><span>{service.number}</span><h3>{service.title}</h3><p>{service.text}</p><Link href="/consultas#nueva-consulta" data-analytics-event="service_interest" data-analytics-label={service.title}>Consultar este servicio <b>↗</b></Link></div>
        </article>)}
      </div>
    </section>

    <section className="specialty-method">
      <div className="shell specialty-method-grid">
        <div>
          <p className="eyebrow light"><span></span> Método MetroClima</p>
          <h2>Del relevamiento a la entrega.</h2>
          <p>Un proceso trazable para que sepas qué se hará, por qué y cómo queda verificado.</p>
        </div>
        <ol>
          <li><span>01</span><div><h3>Relevamos</h3><p>Necesidad, condiciones del lugar y alcance real.</p></div></li>
          <li><span>02</span><div><h3>Proponemos</h3><p>Alternativa técnica, materiales y presupuesto claro.</p></div></li>
          <li><span>03</span><div><h3>Coordinamos</h3><p>Fecha, horarios, acceso y requisitos de seguridad.</p></div></li>
          <li><span>04</span><div><h3>Ejecutamos y verificamos</h3><p>Trabajo, control final, orden y garantía.</p></div></li>
        </ol>
      </div>
    </section>

    <section className="portfolio-section specialty-portfolio">
      <div className="shell">
        <div className="section-heading">
          <div><p className="eyebrow"><span></span> Book de trabajos</p><h2>{isElectric ? "Intervenciones eléctricas reales." : "Climatización que habla por sí sola."}</h2></div>
          <div className="portfolio-heading-copy"><p>Hasta tres imágenes por caso y comentarios de clientes verificados mediante el QR de su presupuesto.</p><Link className="inline-link" href="/trabajos">Ver todos los trabajos <span>→</span></Link></div>
        </div>
        <PortfolioShowcase initialFilter={config.kind} limit={4} />
      </div>
    </section>

    <section className="cta-section">
      <div className="shell cta-card">
        <div><p className="eyebrow light"><span></span> Próximo proyecto</p><h2>Hagámoslo bien desde el inicio.</h2><p>Contanos qué necesitás y preparamos una propuesta clara para tu espacio.</p></div>
        <Link className="button button-light" href="/consultas#nueva-consulta" data-analytics-event="budget_click" data-analytics-label={`cta-${config.kind}`}>Empezar una consulta <span>→</span></Link>
      </div>
    </section>

    <SiteFooter />
  </main>;
}
