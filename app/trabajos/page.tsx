import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioShowcase } from "@/components/PortfolioShowcase";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Trabajos realizados",
  description: "Book de trabajos reales de climatización y electricidad realizados por MetroClima.",
};

export default function TrabajosPage() {
  return <main className="inner-page portfolio-page">
    <div className="inner-header-wrap"><SiteHeader active="trabajos" /></div>
    <section className="page-hero portfolio-hero">
      <div className="shell page-hero-grid">
        <div><p className="eyebrow light"><span></span> Evidencia MetroClima</p><h1>Trabajos reales. Resultados visibles.</h1></div>
        <div><p>Cada caso reúne hasta tres imágenes y puede incluir la experiencia verificada del cliente que recibió el trabajo.</p><Link className="button button-light" href="/consultas#nueva-consulta">Quiero solicitar un presupuesto</Link></div>
      </div>
    </section>
    <section className="portfolio-section portfolio-browser">
      <div className="shell">
        <div className="portfolio-principle"><span>01</span><p><strong>Sin fotos de catálogo.</strong> Este espacio está reservado para intervenciones realizadas por MetroClima y publicadas con criterio profesional.</p></div>
        <PortfolioShowcase showFilters />
      </div>
    </section>
    <SiteFooter />
  </main>;
}
