"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AnalyticsEvent = "page_view" | "whatsapp_click" | "budget_click" | "service_interest";

function sessionId() {
  const storageKey = "metroclima_analytics_session";
  const current = window.sessionStorage.getItem(storageKey);
  if (current) return current;
  const created = window.crypto.randomUUID();
  window.sessionStorage.setItem(storageKey, created);
  return created;
}

function deviceType() {
  if (window.matchMedia("(max-width: 720px)").matches) return "celular";
  if (window.matchMedia("(max-width: 1050px)").matches) return "tablet";
  return "computadora";
}

function trafficSource() {
  const campaignSource = new URLSearchParams(window.location.search).get("utm_source")?.trim().toLowerCase();
  if (campaignSource) return campaignSource.slice(0, 80);
  if (!document.referrer) return "directo";
  try {
    const referringHost = new URL(document.referrer).hostname.replace(/^www\./, "");
    const currentHost = window.location.hostname.replace(/^www\./, "");
    if (referringHost === currentHost) return "interno";
    if (referringHost.includes("google")) return "google";
    if (referringHost.includes("instagram")) return "instagram";
    if (referringHost.includes("facebook")) return "facebook";
    return referringHost.slice(0, 80);
  } catch {
    return "referido";
  }
}

async function track(eventType: AnalyticsEvent, pathname: string, label?: string) {
  if (pathname.startsWith("/panel") || pathname.startsWith("/ingreso")) return;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (data.session) return;
  await supabase.from("analiticas_eventos").insert({
    event_type: eventType,
    session_id: sessionId(),
    pathname: pathname.slice(0, 160),
    source: trafficSource(),
    device_type: deviceType(),
    label: label?.slice(0, 120) || null,
  });
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) void track("page_view", pathname);
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-analytics-event]")
        : null;
      const eventType = target?.dataset.analyticsEvent as AnalyticsEvent | undefined;
      if (!target || !eventType || !pathname) return;
      void track(eventType, pathname, target.dataset.analyticsLabel);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return null;
}
