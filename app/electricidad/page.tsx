import type { Metadata } from "next";
import { ServiceLanding, type ServiceLandingConfig } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: "Electricidad profesional",
  description: "Instalaciones eléctricas, tableros, protecciones, circuitos dedicados, iluminación, diagnóstico y mantenimiento en CABA y Gran Buenos Aires.",
};

const config: ServiceLandingConfig = {
  kind: "electricidad",
  eyebrow: "Electricidad MetroClima",
  title: "Energía segura.",
  accent: "Criterio profesional.",
  lead: "Instalaciones y mantenimiento eléctrico pensados para proteger a las personas, los equipos y la continuidad de cada espacio.",
  assurance: "Personal matriculado en electricidad",
  services: [
    { number: "01", title: "Instalaciones y ampliaciones", text: "Canalizaciones, cableado, tomacorrientes, puntos de uso y nuevos circuitos para viviendas, comercios y oficinas." },
    { number: "02", title: "Tableros y protecciones", text: "Armado, reemplazo y ordenamiento de tableros, térmicas, diferenciales, seccionamiento, identificación y adecuaciones." },
    { number: "03", title: "Circuitos para climatización", text: "Alimentaciones dedicadas, protecciones y secciones adecuadas para Split, piso-techo y sistemas de mayor capacidad." },
    { number: "04", title: "Iluminación eficiente", text: "Diseño y renovación de iluminación interior o exterior, tecnología LED, comandos y sectorización según el uso." },
    { number: "05", title: "Diagnóstico y reparación", text: "Fallas, cortes, falsos contactos, recalentamientos, disparos de protecciones y consumos anómalos con búsqueda de causa." },
    { number: "06", title: "Mantenimiento preventivo", text: "Revisión periódica de tableros, aprietes, protecciones, cargas y puntos críticos para anticipar fallas y paradas." },
  ],
};

export default function ElectricidadPage() {
  return <ServiceLanding config={config} />;
}
