import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MetroClima | Climatización profesional",
    template: "%s | MetroClima",
  },
  description:
    "Instalación, mantenimiento y reparación de aire acondicionado para hogares, countries, consorcios y empresas.",
  keywords: [
    "aire acondicionado",
    "instalación de aire acondicionado",
    "mantenimiento de aire acondicionado",
    "MetroClima",
  ],
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/metroclima-logo.png",
    shortcut: "/metroclima-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
