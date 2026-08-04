import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { metroClima } from "@/lib/metroclima";

const services = [
  {
    number: "01",
    title: "Instalación profesional",
    text: "Evaluamos el ambiente, definimos la mejor ubicación y ejecutamos una instalación limpia, segura y pensada para rendir bien.",
    image: "/metroclima-residencial.png",
    alt: "Aire acondicionado instalado en un living contemporáneo",
  },
  {
    number: "02",
    title: "Mantenimiento preventivo",
    text: "Limpieza técnica, control de drenajes, filtros y funcionamiento general para recuperar confort y evitar fallas innecesarias.",
    image: "/metroclima-comercial.png",
    alt: "Climatización integrada en un espacio corporativo",
  },
  {
    number: "03",
    title: "Diagnóstico y reparación",
    text: "Buscamos la causa real del problema, explicamos el diagnóstico con claridad y presupuestamos antes de avanzar.",
    image: "/metroclima-hero.png",
    alt: "Casa contemporánea climatizada al atardecer",
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
            Instalación, mantenimiento y reparación de aire acondicionado para hogares,
            countries, consorcios y empresas.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/consultas#nueva-consulta">Pedí tu presupuesto <span>→</span></Link>
            <Link className="button button-ghost" href="/#servicios">Conocé los servicios</Link>
          </div>
          <div className="hero-trust">
            <span><b>✓</b> Diagnóstico claro</span>
            <span><b>✓</b> Instalación prolija</span>
            <span><b>✓</b> Atención personalizada</span>
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
              trato directo y terminaciones cuidadas para que cada instalación funcione bien y se
              integre al espacio.
            </p>
            <div className="mini-metrics">
              <div><strong>2</strong><span>responsables en cada proyecto</span></div>
              <div><strong>1:1</strong><span>asesoramiento personalizado</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section" id="servicios">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span></span> Lo que hacemos</p>
              <h2>Soluciones pensadas para cada espacio</h2>
            </div>
            <p>Desde una habitación hasta una oficina completa, el criterio es el mismo: confort, seguridad y una ejecución cuidada.</p>
          </div>

          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card" key={service.number}>
                <div className="service-visual">
                  <img src={service.image} alt={service.alt} />
                  <span>{service.number}</span>
                </div>
                <div className="service-copy">
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <Link href="/consultas#nueva-consulta">Consultar por este servicio <span>↗</span></Link>
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
            <Link className="button button-light" href="/consultas#nueva-consulta">Contanos qué necesitás</Link>
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
            <Link className="button button-primary" href="/consultas#nueva-consulta">Hacer una consulta</Link>
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
                  <a key={contact.name} href={contact.href} target="_blank" rel="noreferrer">
                    <span>{contact.name}</span><strong>{contact.display}</strong><b>↗</b>
                  </a>
                ))}
              </div>
            </article>
            <article className="contact-card">
              <span className="contact-card-label">Canales</span>
              <h3>Instagram y consultas</h3>
              <a className="contact-line" href={metroClima.instagramUrl} target="_blank" rel="noreferrer">{metroClima.instagramHandle} ↗</a>
              <Link className="contact-line" href="/consultas#nueva-consulta">Dejar una consulta →</Link>
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
          <Link className="button button-light" href="/consultas#nueva-consulta">Empezar una consulta <span>→</span></Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
