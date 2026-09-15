"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import "./DoorEffects.css";

type Door = "climate" | "electric";

export function SpecialtyDoors() {
  const router = useRouter();
  const [opening, setOpening] = useState<Door | null>(null);

  function openDoor(kind: Door) {
    if (opening) return;
    setOpening(kind);
    window.setTimeout(() => {
      router.push(kind === "climate" ? "/climatizacion" : "/electricidad");
    }, 1500);
  }

  return (
    <div className={`service-moon shell ${opening ? `is-opening-${opening}` : ""}`} aria-label="Elegir especialidad">
      <div className="door-fx door-fx-climate" aria-hidden="true">
        <div className="air-rotor"><span/><span/><span/><b/></div>
        <span className="wind wind-1"/><span className="wind wind-2"/><span className="wind wind-3"/>
        <i className="cold-particle p1"/><i className="cold-particle p2"/><i className="cold-particle p3"/><i className="cold-particle p4"/>
      </div>
      <div className="door-fx door-fx-electric" aria-hidden="true">
        <div className="power-symbol">ϟ</div>
        <span className="electric-flash"/><i className="spark s1"/><i className="spark s2"/><i className="spark s3"/><i className="spark s4"/>
      </div>
      <button className="moon-half moon-climate" type="button" onClick={() => openDoor("climate")} aria-label="Abrir Climatización">
        <div className="moon-content"><small>Confort térmico</small><h2>Climatización</h2><span>Ver servicios →</span></div>
      </button>
      <button className="moon-half moon-electric" type="button" onClick={() => openDoor("electric")} aria-label="Abrir Electricidad">
        <div className="moon-content"><small>Seguridad y continuidad</small><h2>Electricidad</h2><span>Ver servicios →</span></div>
      </button>
    </div>
  );
}
