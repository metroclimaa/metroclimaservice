import type { Metadata } from "next";
import { ConsultasClient } from "./ConsultasClient";

export const metadata: Metadata = {
  title: "Consultas",
  description: "Consultas abiertas sobre instalación, mantenimiento y elección de equipos de aire acondicionado.",
};

export default function ConsultasPage() {
  return <ConsultasClient />;
}
