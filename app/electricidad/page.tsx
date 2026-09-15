import type { Metadata } from "next";
import { ServiceLanding, type ServiceLandingConfig } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: "Electricidad profesional",
  description: "Instalaciones eléctricas, tableros, protecciones, mediciones, puesta a tierra, diagnóstico y mantenimiento en CABA y Gran Buenos Aires.",
};

const config: ServiceLandingConfig = {
  kind: "electricidad",
  eyebrow: "Electricidad MetroClima",
  title: "Electricidad profesional.",
  accent: "Segura, ordenada y documentada.",
  lead: "Instalaciones, tableros, protecciones, mediciones y mantenimiento con criterio técnico, terminaciones cuidadas y una entrega clara para cada cliente.",
  assurance: "Personal matriculado en electricidad",
  services: [
    { number: "01", title: "Instalaciones y ampliaciones", text: "Canalizaciones, cableado, tomacorrientes, puntos de uso y nuevos circuitos para viviendas, comercios y oficinas." },
    { number: "02", title: "Tableros y protecciones", text: "Armado, reemplazo y ordenamiento de tableros, térmicas, diferenciales, seccionamiento, identificación y rotulado de circuitos." },
    { number: "03", title: "Puesta a tierra", text: "Revisión de la instalación, continuidad, mediciones y verificación de las condiciones de puesta a tierra cuando corresponda." },
    { number: "04", title: "Mediciones eléctricas", text: "Controles y mediciones para diagnosticar el estado de la instalación, detectar desvíos y respaldar técnicamente la intervención." },
    { number: "05", title: "Diagnóstico y reparación", text: "Fallas, cortes, falsos contactos, recalentamientos, disparos de protecciones y consumos anómalos con búsqueda de causa." },
    { number: "06", title: "Mantenimiento preventivo", text: "Revisión periódica de tableros, aprietes, protecciones, cargas y puntos críticos para anticipar fallas y paradas." },
  ],
};

export default function ElectricidadPage() {
  return <ServiceLanding config={config} />;
}
