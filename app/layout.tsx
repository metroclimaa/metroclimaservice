import type { Metadata } from "next";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { AdminUsabilityFixes } from "@/components/AdminUsabilityFixes";
import { WorkQuickEditor } from "@/components/WorkQuickEditor";
import "./globals.css";
import "./compact-home.css";
import "./admin-mobile-fixes.css";

export const metadata: Metadata = {
  title: {
    default: "MetroClima | Climatización y electricidad",
    template: "%s | MetroClima",
  },
  description:
    "Climatización y electricidad profesional para hogares, comercios y empresas en CABA y Gran Buenos Aires.",
  keywords: [
    "aire acondicionado",
    "instalación de aire acondicionado",
    "mantenimiento de aire acondicionado",
    "preinstalación de aire acondicionado",
    "VRV VRF",
    "Multi Split",
    "electricista matriculado",
    "instalaciones eléctricas",
    "tableros eléctricos",
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body><AnalyticsTracker /><AdminUsabilityFixes /><WorkQuickEditor />{children}</body>
    </html>
  );
}
