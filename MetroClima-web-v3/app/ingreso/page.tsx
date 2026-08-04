import type { Metadata } from "next";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = {
  title: "Acceso del equipo",
  robots: { index: false, follow: false },
};

export default function IngresoPage() {
  return <LoginClient />;
}
