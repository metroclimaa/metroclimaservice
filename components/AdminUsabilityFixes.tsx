"use client";

import { useEffect } from "react";

export function AdminUsabilityFixes() {
  useEffect(() => {
    const onFocus = (event: FocusEvent) => {
      const input = event.target as HTMLInputElement | null;
      if (!input || input.tagName !== "INPUT" || input.type !== "number") return;
      if (input.value === "0" || input.value === "0.00") requestAnimationFrame(() => input.select());
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, []);
  return null;
}
