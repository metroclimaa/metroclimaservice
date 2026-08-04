import Link from "next/link";
import { metroClima } from "@/lib/metroclima";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="brand brand-footer" href="/">
            <span className="brand-mark"><img src="/metroclima-logo.png" alt="" /></span>
            <span className="brand-copy"><strong>METRO<span>CLIMA</span></strong><small>Climatización profesional</small></span>
          </Link>
          <p>Confort bien pensado, instalaciones prolijas y atención directa de quienes realizan el trabajo.</p>
        </div>
        <div>
          <h3>Servicios</h3>
          <Link href="/#servicios">Instalación</Link>
          <Link href="/#servicios">Mantenimiento</Link>
          <Link href="/#servicios">Diagnóstico y reparación</Link>
        </div>
        <div>
          <h3>Contacto</h3>
          <Link href="/consultas#nueva-consulta">Dejar una consulta</Link>
          {metroClima.whatsapp.map((contact) => (
            <a key={contact.name} href={contact.href} target="_blank" rel="noreferrer">WhatsApp {contact.name}</a>
          ))}
        </div>
        <div>
          <h3>Cobertura</h3>
          <span>{metroClima.coverage}</span>
          <a href={metroClima.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram de MetroClima">Instagram {metroClima.instagramHandle}</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 MetroClima. Todos los derechos reservados.</span>
        <span>Responsables: Cristian · Nicolás</span>
      </div>
    </footer>
  );
}
