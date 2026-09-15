import "./compact-home.css";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { metroClima } from "@/lib/metroclima";

const brands = ["Surrey", "Carrier", "Midea", "BGH", "Samsung", "LG", "Schneider", "Siemens", "ABB", "Cambre", "Sica", "Genrod"];

export default function Home() {
  return (
    <main className="compact-home">
      <SiteHeader active="inicio" />
      <section className="compact-hero">
        <div className="compact-title shell"><p className="compact-kicker">Soluciones técnicas profesionales</p><h1>¿Qué necesitás resolver?</h1></div>
        <div className="service-moon shell" aria-label="Elegir especialidad">
          <Link className="moon-half moon-climate" href="/climatizacion"><div className="moon-content"><small>Confort térmico</small><h2>Climatización</h2><span>Ver servicios →</span></div></Link>
          <Link className="moon-half moon-electric" href="/electricidad"><div className="moon-content"><small>Seguridad y continuidad</small><h2>Electricidad</h2><span>Ver servicios →</span></div></Link>
        </div>
        <div className="compact-backing shell"><span><b>✓</b>Matrícula AC</span><span><b>✓</b>Matrícula eléctrica</span><span><b>✓</b>Seguros vigentes</span><span><b>✓</b>Garantía</span><span><b>✓</b>Atención directa</span></div>
      </section>
      <section className="brand-strip" aria-label="Marcas con las que trabajamos"><p>Marcas con las que trabajamos</p><div className="brand-marquee"><div className="brand-track">{[...brands,...brands].map((brand,index)=><span key={`${brand}-${index}`}>{brand}</span>)}</div></div></section>
      <section className="compact-contact" id="contacto"><div className="shell compact-contact-inner"><div><small>Contacto directo</small><h2>Hablemos de tu proyecto.</h2><p>{metroClima.coverage}</p></div><div className="compact-contact-actions">{metroClima.whatsapp.map((contact)=><a key={contact.name} href={contact.href} target="_blank" rel="noreferrer"><small>WhatsApp</small><strong>{contact.name}</strong><span>{contact.display}</span></a>)}<Link className="compact-budget" href="/consultas#nueva-consulta"><small>Presupuesto</small><strong>Solicitar propuesta</strong><span>Contanos qué necesitás →</span></Link></div></div></section>
    </main>
  );
}
