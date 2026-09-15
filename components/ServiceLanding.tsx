import Link from "next/link";
import { PortfolioShowcase } from "@/components/PortfolioShowcase";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export type ServiceLandingConfig = {
  kind: "climatizacion" | "electricidad";
  eyebrow: string; title: string; accent: string; lead: string; assurance: string;
  services: { number: string; title: string; text: string; image?: string; alt?: string }[];
};

export function ServiceLanding({ config }: { config: ServiceLandingConfig }) {
  const isElectric = config.kind === "electricidad";
  return <main className={`service-landing ${isElectric ? "electric-landing" : "climate-landing"}`}>
    <SiteHeader active={config.kind} />

    <section className="specialty-hero">
      <div className="specialty-hero-media" aria-hidden="true">{isElectric && <div className="electric-board"><span className="electric-line line-a"></span><span className="electric-line line-b"></span><span className="electric-line line-c"></span><div className="electric-module"><i></i><i></i><i></i><b>ON</b></div><div className="electric-reading"><small>INSTALACIÓN</small><strong>SEGURA</strong><span>VERIFICADA</span></div></div>}</div>
      <div className="specialty-hero-shade" aria-hidden="true"></div>
      <div className="shell specialty-hero-copy">
        <p className="eyebrow light"><span></span> {config.eyebrow}</p><h1>{config.title}<br /><em>{config.accent}</em></h1><p>{config.lead}</p>
        <div className="hero-actions"><Link className="button button-primary" href="/consultas#nueva-consulta">Solicitar presupuesto <span>→</span></Link><a className="button button-ghost" href="#especialidad">Ver servicios</a></div>
        <div className="hero-trust"><span><b>✓</b> {config.assurance}</span><span><b>✓</b> Seguros vigentes</span><span><b>✓</b> Garantía</span></div>
      </div>
    </section>

    <section className="specialty-intro" id="especialidad"><div className="shell specialty-intro-grid"><div><p className="eyebrow"><span></span> {isElectric ? "Electricidad profesional" : "Climatización profesional"}</p><h2>{isElectric ? "Seguridad, orden y trazabilidad." : "Confort pensado como sistema."}</h2></div><p>{isElectric ? "Ejecutamos y diagnosticamos instalaciones eléctricas con foco en protecciones, orden, capacidad, mediciones y continuidad. El objetivo es que el cliente entienda qué se hizo y cómo queda su instalación." : "Evaluamos capacidad, ubicación, alimentación, drenaje, circulación de aire y uso para lograr rendimiento y una instalación cuidada."}</p></div></section>

    <section className="specialty-services"><div className="shell specialty-service-grid">{config.services.map((service) => <article className="specialty-card" key={service.number}>{service.image ? <div className="specialty-card-image"><img src={service.image} alt={service.alt ?? ""} loading="lazy" /></div> : <div className="electric-card-visual" aria-hidden="true"><span>{service.number}</span><i></i><i></i><i></i></div>}<div><span>{service.number}</span><h3>{service.title}</h3><p>{service.text}</p></div></article>)}</div></section>

    <section className="specialty-method"><div className="shell specialty-method-grid"><div><p className="eyebrow light"><span></span> Método MetroClima</p><h2>Relevamos. Ejecutamos. Verificamos. Documentamos.</h2><p>Un proceso simple y trazable, desde la necesidad inicial hasta la entrega.</p></div><ol><li><span>01</span><div><h3>Relevamiento</h3><p>Necesidad, condiciones del lugar y alcance real.</p></div></li><li><span>02</span><div><h3>Propuesta</h3><p>Alternativa técnica, materiales y presupuesto claro.</p></div></li><li><span>03</span><div><h3>Ejecución y verificación</h3><p>Trabajo ordenado, controles finales y registro.</p></div></li><li><span>04</span><div><h3>Entrega</h3><p>Información del trabajo organizada para el cliente.</p></div></li></ol></div></section>

    {isElectric && <section className="identity-section"><div className="shell identity-grid"><div><p className="eyebrow"><span></span> Documentación Digital MetroClima</p><h2>Tu instalación también queda documentada.</h2></div><div className="identity-copy"><p>Estamos preparando una entrega digital estandarizada para trabajos eléctricos: hoja membretada MetroClima, planos con rótulo predefinido, identificación de circuitos, secciones, protecciones, mediciones, fotografías y observaciones.</p><p>Los rótulos tendrán campos fijos para completar cliente, obra, ubicación, documento, revisión, fecha, escala y número de hoja. La documentación podrá actualizarse por revisión para conservar el historial de la instalación.</p></div></div></section>}

    <section className="portfolio-section specialty-portfolio"><div className="shell"><div className="section-heading"><div><p className="eyebrow"><span></span> Trabajos</p><h2>{isElectric ? "Tableros, instalaciones y mediciones." : "Climatización que habla por sí sola."}</h2></div><div className="portfolio-heading-copy"><p>Casos documentados con imágenes del trabajo y experiencia del cliente.</p><Link className="inline-link" href="/trabajos">Ver book completo <span>→</span></Link></div></div><PortfolioShowcase initialFilter={config.kind} limit={4} /></div></section>

    <section className="cta-section"><div className="shell cta-card"><div><p className="eyebrow light"><span></span> Próximo proyecto</p><h2>Contanos qué necesitás.</h2><p>Preparamos una propuesta clara para tu espacio.</p></div><Link className="button button-light" href="/consultas#nueva-consulta">Solicitar presupuesto <span>→</span></Link></div></section>
    <SiteFooter />
  </main>;
}
