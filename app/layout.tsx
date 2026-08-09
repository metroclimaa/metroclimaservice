import type { Metadata } from "next";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MetroClima | Climatización profesional",
    template: "%s | MetroClima",
  },
  description:
    "Preinstalación, instalación, mantenimiento y reparación de sistemas Split, Multi Split, piso-techo y VRV/VRF en CABA y Gran Buenos Aires.",
  keywords: [
    "aire acondicionado",
    "instalación de aire acondicionado",
    "mantenimiento de aire acondicionado",
    "preinstalación de aire acondicionado",
    "VRV VRF",
    "Multi Split",
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
      <body><AnalyticsTracker />{children}</body>
    </html>
  );
}
