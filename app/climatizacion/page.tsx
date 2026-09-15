import type { Metadata } from "next";
import { ServiceLanding, type ServiceLandingConfig } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: "Climatización profesional",
  description: "Preinstalaciones, Split, Multi Split, piso-techo, VRV/VRF, mantenimiento y reparación en CABA y Gran Buenos Aires.",
};

const config: ServiceLandingConfig = {
  kind: "climatizacion",
  eyebrow: "Climatización MetroClima",
  title: "Confort preciso.",
  accent: "Instalaciones que perduran.",
  lead: "Diseñamos, instalamos y mantenemos soluciones de climatización para hogares, comercios y empresas.",
  assurance: "Personal matriculado en AC",
  services: [
    { number: "01", title: "Preinstalaciones", text: "Cañerías de cobre, desagües, alimentación, pases y previsiones antes de cerrar paredes o cielorrasos.", image: "/servicio-preinstalacion.webp", alt: "Cañerías y canalizaciones de una preinstalación de aire acondicionado" },
    { number: "02", title: "Split y Multi Split", text: "Instalación y puesta en marcha con ubicación, drenaje, vacío, alimentación y terminaciones controladas.", image: "/servicio-split-multisplit.webp", alt: "Equipo Split instalado en un ambiente" },
    { number: "03", title: "Equipos piso-techo", text: "Mayor capacidad y distribución uniforme para salones, locales, oficinas y espacios comerciales.", image: "/servicio-piso-techo.webp", alt: "Equipo de aire acondicionado piso-techo" },
    { number: "04", title: "Sistemas VRV / VRF", text: "Instalación, puesta en marcha, mantenimiento y diagnóstico de soluciones centralizadas para proyectos comerciales.", image: "/servicio-vrv-vrf.webp", alt: "Sistema de climatización VRV VRF comercial" },
    { number: "05", title: "Mantenimiento y limpieza", text: "Filtros, serpentinas, bandejas, drenajes y controles funcionales para recuperar higiene y rendimiento.", image: "/servicio-mantenimiento.webp", alt: "Mantenimiento técnico de equipo de aire acondicionado" },
    { number: "06", title: "Diagnóstico y reparación", text: "Búsqueda de la causa real, verificación eléctrica y frigorífica, reparación y control final de funcionamiento.", image: "/servicio-diagnostico.webp", alt: "Diagnóstico de una unidad exterior de aire acondicionado" },
  ],
};

export default function ClimatizacionPage() {
  return <ServiceLanding config={config} />;
}
