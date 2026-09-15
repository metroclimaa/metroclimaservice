import type { Metadata } from "next";
import { ExperienceClient } from "./ExperienceClient";

export const metadata: Metadata = {
  title: "Contanos tu experiencia",
  description: "Formulario privado para clientes de MetroClima.",
  robots: { index: false, follow: false },
};

export default function ExperienciaPage() {
  return <ExperienceClient />;
}
