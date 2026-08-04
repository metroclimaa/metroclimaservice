import Link from "next/link";

export function SiteHeader({ active = "inicio" }: { active?: string }) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="MetroClima, inicio">
          <span className="brand-mark">
            <img src="/metroclima-logo.png" alt="" />
          </span>
          <span className="brand-copy">
            <strong>METRO<span>CLIMA</span></strong>
            <small>Climatización profesional</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Navegación principal">
          <Link className={active === "inicio" ? "is-active" : ""} href="/">Inicio</Link>
          <Link href="/#servicios">Servicios</Link>
          <Link className={active === "consultas" ? "is-active" : ""} href="/consultas">Consultas</Link>
          <Link href="/#nosotros">Nosotros</Link>
          <Link href="/#contacto">Contacto</Link>
        </nav>

        <div className="header-actions">
          <Link className="text-link" href="/ingreso">Acceso equipo</Link>
          <Link className="button button-small button-primary" href="/consultas#nueva-consulta">
            Consultar
          </Link>
        </div>

        <details className="mobile-menu">
          <summary aria-label="Abrir menú"><span></span><span></span><span></span></summary>
          <nav aria-label="Navegación móvil">
            <Link href="/">Inicio</Link>
            <Link href="/#servicios">Servicios</Link>
            <Link href="/consultas">Consultas</Link>
            <Link href="/#nosotros">Nosotros</Link>
            <Link href="/#contacto">Contacto</Link>
            <Link href="/ingreso">Acceso equipo</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
