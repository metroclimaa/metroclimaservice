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
    { number: "01", title: "Instalaciones y ampliaciones", text: "Canalizaciones, cableado, tomacorrientes, puntos de uso y nuevos circuitos para viviendas, comercios y oficinas.", image: "https://d2wvwvig0d1mx7.cloudfront.net/data/org/16569/media/img/source/edit/3346466_edit.webp", alt: "Electricista trabajando sobre una instalación con canalizaciones y tablero" },
    { number: "02", title: "Tableros y protecciones", text: "Armado, reemplazo y ordenamiento de tableros, térmicas, diferenciales, seccionamiento, identificación y rotulado de circuitos.", image: "https://furijoi.com/imag/panel.png", alt: "Tablero eléctrico profesional con protecciones y cableado ordenado" },
    { number: "03", title: "Puesta a tierra", text: "Revisión de la instalación, continuidad, mediciones y verificación de las condiciones de puesta a tierra cuando corresponda.", image: "https://res.cloudinary.com/iwh/image/upload/q_auto%2Cg_center/w_1024%2Ch_768%2Cc_lpad/assets/1/26/MRU-200GPS-3.jpg", alt: "Medición de resistencia de puesta a tierra con telurómetro" },
    { number: "04", title: "Mediciones eléctricas", text: "Controles y mediciones para diagnosticar el estado de la instalación, detectar desvíos y respaldar técnicamente la intervención.", image: "https://www.bursaacilelektrikcim.com/storage/slider/Dm2UfWtJlPSOMYLVurc6.webp", alt: "Medición eléctrica en tablero mediante pinza amperométrica" },
    { number: "05", title: "Diagnóstico y reparación", text: "Fallas, cortes, falsos contactos, recalentamientos, disparos de protecciones y consumos anómalos con búsqueda de causa.", image: "https://static.wixstatic.com/media/331409_34e7f6a3b4244911b71e4535ea4f2644~mv2.jpg/v1/fill/w_980%2Ch_653%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/Electrician%20checking%20the%20electrical%20system%2C%20with%20an%20electric%20meter%20for%20the%20safety%20of%20the%20s.jpg", alt: "Diagnóstico de una instalación eléctrica con instrumento de medición" },
    { number: "06", title: "Mantenimiento preventivo", text: "Revisión periódica de tableros, aprietes, protecciones, cargas y puntos críticos para anticipar fallas y paradas.", image: "https://image.makewebcdn.com/makeweb/0/HbbeRxAjf/images/electrical_system_preventive_maintenance.webp?v=202405291424", alt: "Inspección y mantenimiento preventivo de tablero eléctrico" },
  ],
};

export default function ElectricidadPage() {
  return <ServiceLanding config={config} />;
}
