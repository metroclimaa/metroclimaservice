"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Door = "climate" | "electric";

export function SpecialtyDoors() {
  const router = useRouter();
  const [opening, setOpening] = useState<Door | null>(null);

  function openDoor(kind: Door) {
    if (opening) return;
    setOpening(kind);
    window.setTimeout(() => router.push(kind === "climate" ? "/climatizacion" : "/electricidad"), 760);
  }

  return (
    <div className={`service-moon shell ${opening ? `is-opening-${opening}` : ""}`} aria-label="Elegir especialidad">
      <button className="moon-half moon-climate" type="button" onClick={() => openDoor("climate")} aria-label="Abrir Climatización">
        <div className="climate-air" aria-hidden="true"><i></i><i></i><i></i><b></b><b></b><b></b></div>
        <div className="moon-content"><small>Confort térmico</small><h2>Climatización</h2><span>Ver servicios →</span></div>
      </button>
      <button className="moon-half moon-electric" type="button" onClick={() => openDoor("electric")} aria-label="Abrir Electricidad">
        <div className="electric-energy" aria-hidden="true"><i></i><i></i><i></i><b></b><b></b><b></b></div>
        <div className="moon-content"><small>Seguridad y continuidad</small><h2>Electricidad</h2><span>Ver servicios →</span></div>
      </button>
    </div>
  );
}
