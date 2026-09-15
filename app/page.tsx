import Link from "next/link";
import { PortfolioShowcase } from "@/components/PortfolioShowcase";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { metroClima } from "@/lib/metroclima";

const standards = [
  { value: "01", title: "Diagnóstico técnico", text: "Primero entendemos la necesidad, el espacio y las condiciones reales del trabajo." },
  { value: "02", title: "Propuesta clara", text: "Alcance, mano de obra y materiales diferenciados para decidir sin sorpresas." },
  { value: "03", title: "Ejecución responsable", text: "Personal matriculado, seguros vigentes, orden, verificación y garantía." },
];

export default function Home() {
  return (
    <main className="dual-home">
      <SiteHeader active="inicio" />

      <section className="dual-hero">
        <div className="dual-hero-copy shell">
          <p className="eyebrow light"><span></span> Dos especialidades. Un solo respaldo.</p>
          <h1>Confort y energía,<br /><em>bien resueltos.</em></h1>
          <p>Climatización y electricidad profesional para hogares, comercios y empresas de CABA y Gran Buenos Aires.</p>
        </div>

        <div className="dual-service-stage shell" aria-label="Elegir especialidad">
          <Link className="dual-service climate" href="/climatizacion">
            <span className="dual-index">01 / CLIMA</span>
            <div>
              <small>Confort térmico</small>
              <h2>Climatización</h2>
              <p>Preinstalación, instalación, mantenimiento y reparación de Split, Multi Split, piso-techo y VRV/VRF.</p>
            </div>
            <strong>Explorar climatización <b>↗</b></strong>
          </Link>
          <Link className="dual-service electric" href="/electricidad">
            <span className="dual-index">02 / ELÉCTRICA</span>
            <div>
              <small>Seguridad y continuidad</small>
              <h2>Electricidad</h2>
              <p>Instalaciones, tableros, protecciones, circuitos dedicados, iluminación, diagnóstico y mantenimiento.</p>
            </div>
            <strong>Explorar electricidad <b>↗</b></strong>
          </Link>
        </div>

        <div className="dual-trust shell">
          <span><b>✓</b> Seguros vigentes</span>
          <span><b>✓</b> Matrículas al día</span>
          <span><b>✓</b> Garantía escrita</span>
          <span><b>✓</b> Atención directa</span>
        </div>
      </section>

      <section className="identity-section" id="nosotros">
        <div className="shell identity-grid">
          <div>
            <p className="eyebrow"><span></span> MetroClima</p>
            <h2>Una mirada integral para cada espacio.</h2>
          </div>
          <div className="identity-copy">
            <p>Somos Cristian y Nicolás. Unimos climatización y electricidad para resolver el proyecto completo con un único equipo responsable, desde el relevamiento hasta la entrega.</p>
            <p>Trabajamos con criterio técnico, terminaciones cuidadas y documentación preparada para hogares, comercios y empresas.</p>
          </div>
        </div>
      </section>

      <section className="standard-section">
        <div className="shell">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow light"><span></span> Estándar MetroClima</p>
              <h2>Una sola forma de trabajar: bien.</h2>
            </div>
            <p>La especialidad cambia. El nivel de responsabilidad, no.</p>
          </div>
          <div className="standard-grid">
            {standards.map((item) => <article key={item.value}><span>{item.value}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="portfolio-section home-portfolio">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span></span> Trabajos documentados</p>
              <h2>Resultados que se pueden ver.</h2>
            </div>
            <div className="portfolio-heading-copy">
              <p>Cada caso puede mostrar tres imágenes del proceso y una reseña verificada del cliente.</p>
              <Link className="inline-link" href="/trabajos">Abrir el book completo <span>→</span></Link>
            </div>
          </div>
          <PortfolioShowcase limit={4} />
        </div>
      </section>

      <section className="contact-section" id="contacto">
        <div className="shell">
          <div className="section-heading contact-heading">
            <div>
              <p className="eyebrow"><span></span> Contacto directo</p>
              <h2>Empecemos por entender lo que necesitás.</h2>
            </div>
            <p>Elegí el canal más cómodo. Coordinamos visitas según ubicación, disponibilidad y tipo de trabajo.</p>
          </div>
          <div className="contact-grid">
            <article className="contact-card contact-card-featured">
              <span className="contact-card-label">WhatsApp</span>
              <h3>Hablemos ahora</h3>
              <div className="whatsapp-list">
                {metroClima.whatsapp.map((contact) => (
                  <a key={contact.name} href={contact.href} target="_blank" rel="noreferrer" data-analytics-event="whatsapp_click" data-analytics-label={contact.name}>
                    <span>{contact.name}</span><strong>{contact.display}</strong><b>↗</b>
                  </a>
                ))}
              </div>
            </article>
            <article className="contact-card">
              <span className="contact-card-label">Presupuesto</span>
              <h3>Una propuesta clara</h3>
              <p>Contanos si necesitás climatización, electricidad o una solución combinada.</p>
              <Link className="contact-line" href="/consultas#nueva-consulta" data-analytics-event="budget_click" data-analytics-label="contacto">Solicitar presupuesto →</Link>
            </article>
            <article className="contact-card">
              <span className="contact-card-label">Cobertura</span>
              <h3>{metroClima.coverage}</h3>
              <p>Atención para hogares, comercios y empresas.</p>
            </article>
            <article className="contact-card">
              <span className="contact-card-label">Respaldo</span>
              <h3>Trabajo documentado</h3>
              <p>{metroClima.paymentMethods}.</p>
              <strong className="warranty-line">✓ {metroClima.warranty}</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="shell cta-card dual-cta">
          <div>
            <p className="eyebrow light"><span></span> MetroClima integral</p>
            <h2>Un equipo. Todo resuelto.</h2>
            <p>Climatización y electricidad coordinadas con el mismo estándar profesional.</p>
          </div>
          <Link className="button button-light" href="/consultas#nueva-consulta" data-analytics-event="budget_click" data-analytics-label="cta-final">Contanos tu proyecto <span>→</span></Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
