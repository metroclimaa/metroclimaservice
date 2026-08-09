import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { metroClima } from "@/lib/metroclima";

const services = [
  {
    number: "01",
    title: "Preinstalaciones",
    text: "Preparamos cañerías de cobre, desagües, alimentación eléctrica y pases antes de cerrar paredes o cielorrasos.",
    image: "/servicio-preinstalacion.webp",
    alt: "Cañerías, desagüe y canalizaciones preparados durante una preinstalación",
  },
  {
    number: "02",
    title: "Split y Multi Split",
    text: "Instalamos equipos residenciales y sistemas con varias unidades interiores, cuidando rendimiento, drenaje y terminaciones.",
    image: "/servicio-split-multisplit.webp",
    alt: "Equipo Split instalado en un ambiente residencial",
  },
  {
    number: "03",
    title: "Equipos piso-techo",
    text: "Soluciones de mayor capacidad para salones, oficinas, locales y espacios comerciales que necesitan una distribución uniforme.",
    image: "/servicio-piso-techo.webp",
    alt: "Equipo piso-techo instalado en un espacio comercial",
  },
  {
    number: "04",
    title: "Sistemas VRV / VRF",
    text: "Instalación, puesta en marcha, mantenimiento y diagnóstico para proyectos comerciales y sistemas de climatización centralizados.",
    image: "/servicio-vrv-vrf.webp",
    alt: "Climatización centralizada para oficinas y empresas",
  },
  {
    number: "05",
    title: "Mantenimiento y limpieza",
    text: "Limpieza técnica, control de drenajes, filtros y funcionamiento general con productos adecuados para cada tipo de suciedad.",
    image: "/servicio-mantenimiento.webp",
    alt: "Limpieza técnica de filtros y unidad interior de un equipo Split",
  },
  {
    number: "06",
    title: "Diagnóstico y reparación",
    text: "Detectamos la causa real de la falla y también adecuamos circuitos, protecciones y alimentación eléctrica cuando el proyecto lo requiere.",
    image: "/servicio-diagnostico.webp",
    alt: "Diagnóstico técnico con instrumental sobre una unidad exterior",
  },
];

const questions = [
  {
    tag: "Elección del equipo",
    question: "¿Qué potencia necesito para un living de 30 m²?",
    answer: "Los metros cuadrados orientan, pero también influyen el sol, la altura, las ventanas y cuántas personas usan el ambiente.",
  },
  {
    tag: "Tecnología inverter",
    question: "¿Conviene comprar un aire inverter?",
    answer: "Suele ser una muy buena opción cuando el equipo se usa varias horas: regula la potencia, consume menos y mantiene mejor la temperatura.",
  },
  {
    tag: "Mantenimiento",
    question: "¿Cada cuánto tiempo hay que hacer una limpieza?",
    answer: "Los filtros se revisan con frecuencia y una limpieza técnica anual ayuda a sostener el rendimiento, especialmente antes del verano.",
  },
];

export default function Home() {
  return (
    <main>
      <SiteHeader active="inicio" />

      <section className="hero">
        <div className="hero-image" aria-hidden="true"></div>
        <div className="hero-wash" aria-hidden="true"></div>
        <div className="airflow airflow-one" aria-hidden="true"></div>
        <div className="airflow airflow-two" aria-hidden="true"></div>
        <div className="shell hero-content">
          <p className="eyebrow light"><span></span> Climatización a tu medida</p>
          <h1>Confort que se siente.<br /><em>Trabajo que se nota.</em></h1>
          <p className="hero-lead">
            Preinstalación, instalación, mantenimiento y reparación de sistemas de
            climatización para hogares, comercios y empresas.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/consultas#nueva-consulta" data-analytics-event="budget_click" data-analytics-label="hero">Pedí tu presupuesto <span>→</span></Link>
            <Link className="button button-ghost" href="/#servicios">Conocé los servicios</Link>
          </div>
          <div className="hero-trust">
            <span><b>✓</b> Seguros vigentes</span>
            <span><b>✓</b> Matrícula AC</span>
            <span><b>✓</b> Matrícula eléctrica</span>
          </div>
        </div>
        <a className="scroll-cue" href="#servicios" aria-label="Ir a servicios"><span></span>Descubrí más</a>
      </section>

      <section className="intro-section" id="nosotros">
        <div className="shell intro-grid">
          <div>
            <p className="eyebrow"><span></span> MetroClima</p>
            <h2>La temperatura ideal también se construye.</h2>
          </div>
          <div className="intro-copy">
            <p>
              Somos Cristian y Nicolás. En MetroClima combinamos criterio técnico,
              trato directo y terminaciones cuidadas. Acompañamos cada proyecto desde la
              preinstalación hasta la puesta en marcha y el mantenimiento del sistema.
            </p>
            <div className="mini-metrics">
              <div><strong>2</strong><span>responsables en cada proyecto</span></div>
              <div><strong>1:1</strong><span>asesoramiento personalizado</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="backing-section" aria-labelledby="respaldo-title">
        <div className="shell backing-grid">
          <div>
            <p className="eyebrow light"><span></span> Trabajo con respaldo</p>
            <h2 id="respaldo-title">Seguridad técnica en cada intervención.</h2>
          </div>
          <div className="backing-list">
            {[
              "Seguros de trabajo vigentes",
              "Personal matriculado en aire acondicionado",
              "Personal matriculado en electricidad",
            ].map((item) => <span key={item}><b>✓</b>{item}</span>)}
            <span><b>✓</b>Garantía sobre nuestros trabajos</span>
          </div>
        </div>
      </section>

      <section className="services-section" id="servicios">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span></span> Lo que hacemos</p>
              <h2>Soluciones para cada etapa y cada escala</h2>
            </div>
            <p>Desde una preinstalación en obra hasta un sistema VRV/VRF, trabajamos con el mismo criterio: seguridad, rendimiento y terminaciones cuidadas.</p>
          </div>

          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card" key={service.number}>
                <div className="service-visual">
                  <img
                    src={service.image}
                    alt={service.alt}
                    width="1440"
                    height="1080"
                    loading="lazy"
                  />
                  <span>{service.number}</span>
                </div>
                <div className="service-copy">
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <Link href="/consultas#nueva-consulta" data-analytics-event="service_interest" data-analytics-label={service.title}>Consultar por este servicio <span>↗</span></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="method-section">
        <div className="shell method-grid">
          <div className="method-intro">
            <p className="eyebrow light"><span></span> Cómo trabajamos</p>
            <h2>Simple, claro y sin sorpresas.</h2>
            <p>Te acompañamos desde la primera consulta hasta la puesta en marcha del equipo.</p>
            <Link className="button button-light" href="/consultas#nueva-consulta" data-analytics-event="budget_click" data-analytics-label="metodo">Contanos qué necesitás</Link>
          </div>
          <ol className="method-list">
            <li><span>01</span><div><h3>Nos contás tu necesidad</h3><p>Podés sumar fotos, medidas y tus datos de contacto de forma privada.</p></div></li>
            <li><span>02</span><div><h3>Evaluamos el trabajo</h3><p>Revisamos el ambiente y te explicamos la alternativa más conveniente.</p></div></li>
            <li><span>03</span><div><h3>Recibís un presupuesto claro</h3><p>Mano de obra y materiales aparecen separados, sin costos escondidos.</p></div></li>
            <li><span>04</span><div><h3>Coordinamos y ejecutamos</h3><p>Definimos fecha, realizamos el trabajo y verificamos el funcionamiento.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="forum-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span></span> Consultas abiertas</p>
              <h2>Preguntá. Te respondemos nosotros.</h2>
            </div>
            <p>Un espacio simple para resolver dudas reales. Si dejás tus datos, quedan privados y sólo el equipo de MetroClima puede verlos.</p>
          </div>
          <div className="questions-grid">
            {questions.map((item, index) => (
              <article className="question-card" key={item.question}>
                <div className="question-meta"><span>{item.tag}</span><small>Respuesta MetroClima</small></div>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
                <Link href="/consultas">Ver conversación <span>→</span></Link>
                <b className="question-number">0{index + 1}</b>
              </article>
            ))}
          </div>
          <div className="forum-actions">
            <Link className="button button-primary" href="/consultas#nueva-consulta" data-analytics-event="budget_click" data-analytics-label="foro">Hacer una consulta</Link>
            <Link className="inline-link" href="/consultas">Ver todas las consultas <span>→</span></Link>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contacto">
        <div className="shell">
          <div className="section-heading contact-heading">
            <div>
              <p className="eyebrow"><span></span> Contacto directo</p>
              <h2>Estamos cerca cuando necesitás confort.</h2>
            </div>
            <p>Elegí el canal que te resulte más cómodo. Atendemos consultas y coordinamos visitas en toda nuestra zona de cobertura.</p>
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
              <span className="contact-card-label">Canales</span>
              <h3>Instagram y consultas</h3>
              <a className="contact-line" href={metroClima.instagramUrl} target="_blank" rel="noreferrer">{metroClima.instagramHandle} ↗</a>
              <Link className="contact-line" href="/consultas#nueva-consulta" data-analytics-event="budget_click" data-analytics-label="contacto">Dejar una consulta →</Link>
            </article>
            <article className="contact-card">
              <span className="contact-card-label">Cobertura</span>
              <h3>{metroClima.coverage}</h3>
              <p>Coordinamos cada visita según ubicación, disponibilidad y tipo de trabajo.</p>
            </article>
            <article className="contact-card">
              <span className="contact-card-label">Pagos y respaldo</span>
              <h3>Opciones simples</h3>
              <p>{metroClima.paymentMethods}.</p>
              <strong className="warranty-line">✓ {metroClima.warranty}</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="shell cta-card">
          <div>
            <p className="eyebrow light"><span></span> Tu próximo ambiente</p>
            <h2>Hablemos de confort.</h2>
            <p>Contanos qué necesitás y armamos una propuesta clara para tu espacio.</p>
          </div>
          <Link className="button button-light" href="/consultas#nueva-consulta" data-analytics-event="budget_click" data-analytics-label="cta-final">Empezar una consulta <span>→</span></Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
