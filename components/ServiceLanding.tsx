import Link from "next/link";
import { PortfolioShowcase } from "@/components/PortfolioShowcase";
import { SiteHeader } from "@/components/SiteHeader";

export type ServiceLandingConfig = {
  kind: "climatizacion" | "electricidad";
  eyebrow: string; title: string; accent: string; lead: string; assurance: string;
  services: { number: string; title: string; text: string; image?: string; alt?: string }[];
};

export function ServiceLanding({ config }: { config: ServiceLandingConfig }) {
  const isElectric = config.kind === "electricidad";
  return <main className={`compact-service ${isElectric ? "compact-electric" : "compact-climate"}`}>
    <SiteHeader active={config.kind} />
    <section className="compact-service-hero">
      <div className="compact-service-bg" aria-hidden="true"></div>
      <div className="shell compact-service-copy">
        <Link className="back-home" href="/">← Volver a la portada</Link>
        <p className="compact-kicker">{config.eyebrow}</p>
        <h1>{config.title}<br/><em>{config.accent}</em></h1>
        <p>{config.lead}</p>
        <div className="compact-service-actions"><a href="#servicios">Ver servicios ↓</a><Link href="/consultas#nueva-consulta">Solicitar presupuesto →</Link></div>
        <div className="compact-service-trust"><span>✓ {config.assurance}</span><span>✓ Seguros vigentes</span><span>✓ Garantía</span></div>
      </div>
    </section>

    <section className="compact-service-list" id="servicios"><div className="shell"><div className="compact-section-head"><div><small>Servicios</small><h2>{isElectric ? "Electricidad clara y segura." : "Climatización bien resuelta."}</h2></div><p>{isElectric ? "Instalación, protección, medición y mantenimiento en una propuesta simple y profesional." : "Instalación, mantenimiento y diagnóstico con foco en rendimiento, terminación y confiabilidad."}</p></div><div className="compact-service-grid">{config.services.map(service=><article className="compact-service-card" key={service.number}>{service.image ? <img src={service.image} alt={service.alt ?? ""} loading="lazy"/> : <div className={`service-photo electric-photo-${service.number}`}></div>}<div><small>{service.number}</small><h3>{service.title}</h3><p>{service.text}</p></div></article>)}</div></div></section>

    <section className="compact-method"><div className="shell"><small>Método MetroClima</small><div className="compact-method-row"><span><b>01</b> Relevamos</span><span><b>02</b> Proponemos</span><span><b>03</b> Ejecutamos y verificamos</span><span><b>04</b> Documentamos</span></div></div></section>

    {isElectric && <section className="compact-document"><div className="shell compact-document-inner"><div><small>Documentación digital</small><h2>La instalación queda documentada.</h2></div><p>Entrega digital MetroClima con hoja membretada, planos y rótulos predefinidos, circuitos, secciones, protecciones, mediciones, fotografías y observaciones. Los campos quedan listos para completar según cada obra.</p></div></section>}

    <section className="compact-work"><div className="shell"><div className="compact-section-head"><div><small>Trabajos realizados</small><h2>{isElectric ? "Instalaciones, tableros y mediciones." : "Nuestros trabajos de climatización."}</h2></div><Link href="/trabajos">Ver todos →</Link></div><PortfolioShowcase initialFilter={config.kind} limit={4}/></div></section>

    <section className="compact-service-footer"><div className="shell"><Link href="/">← Portada</Link><strong>¿Tenés un proyecto?</strong><Link href="/consultas#nueva-consulta">Solicitar presupuesto →</Link></div></section>
  </main>;
}
