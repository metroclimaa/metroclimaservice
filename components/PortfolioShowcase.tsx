"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

type Rubro = "todos" | "climatizacion" | "electricidad";
type WorkImage = { id: string; trabajo_id: string; storage_path: string; orden: number; alt: string };
type Review = { presupuesto_id: string; nombre_publico: string; puntuacion: number; comentario: string };
type WorkRow = {
  id: string;
  presupuesto_id: string;
  titulo_publico: string;
  resumen: string;
  localidad_publica: string | null;
  fecha_realizacion: string | null;
  destacado: boolean;
  rubro: "climatizacion" | "electricidad";
};
type Work = WorkRow & { images: (WorkImage & { url: string })[]; review?: Review };

export function PortfolioShowcase({
  initialFilter = "todos",
  showFilters = false,
  limit,
}: {
  initialFilter?: Rubro;
  showFilters?: boolean;
  limit?: number;
}) {
  const [works, setWorks] = useState<Work[]>([]);
  const [filter, setFilter] = useState<Rubro>(initialFilter);
  const [loading, setLoading] = useState(hasSupabaseConfig);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const client = supabase;
    let mounted = true;

    async function loadPortfolio() {
      const { data: workRows, error } = await client
        .from("trabajos")
        .select("id,presupuesto_id,titulo_publico,resumen,localidad_publica,fecha_realizacion,destacado,rubro")
        .eq("publicado", true)
        .order("destacado", { ascending: false })
        .order("fecha_realizacion", { ascending: false });

      if (error || !workRows?.length) {
        if (mounted) {
          setWorks([]);
          setLoading(false);
        }
        return;
      }

      const rows = workRows as unknown as WorkRow[];
      const workIds = rows.map((work) => work.id);
      const budgetIds = rows.map((work) => work.presupuesto_id);
      const [imageResult, reviewResult] = await Promise.all([
        client.from("trabajo_imagenes").select("id,trabajo_id,storage_path,orden,alt").in("trabajo_id", workIds).order("orden"),
        client.from("resenas_clientes").select("presupuesto_id,nombre_publico,puntuacion,comentario").in("presupuesto_id", budgetIds).eq("aprobada", true),
      ]);

      const images = (imageResult.data ?? []) as WorkImage[];
      const reviews = (reviewResult.data ?? []) as Review[];
      const hydrated = rows.map((work) => ({
        ...work,
        images: images
          .filter((image) => image.trabajo_id === work.id)
          .map((image) => ({
            ...image,
            url: client.storage.from("trabajos").getPublicUrl(image.storage_path).data.publicUrl,
          })),
        review: reviews.find((review) => review.presupuesto_id === work.presupuesto_id),
      }));

      if (mounted) {
        setWorks(hydrated);
        setLoading(false);
      }
    }

    void loadPortfolio();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const result = filter === "todos"
      ? works
      : works.filter((work) => work.rubro === filter);
    return typeof limit === "number" ? result.slice(0, limit) : result;
  }, [filter, limit, works]);

  return <>
    {showFilters && <div className="portfolio-filters" role="tablist" aria-label="Filtrar trabajos por especialidad">
      {([
        ["todos", "Todos"],
        ["climatizacion", "Climatización"],
        ["electricidad", "Electricidad"],
      ] as [Rubro, string][]).map(([value, label]) => (
        <button key={value} type="button" className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{label}</button>
      ))}
    </div>}

    {loading && <div className="portfolio-loading" aria-live="polite"><span></span><p>Cargando trabajos realizados…</p></div>}

    {!loading && filtered.length > 0 && <div className="portfolio-grid">
      {filtered.map((work) => (
        <article className="portfolio-card" key={work.id}>
          <div className={`portfolio-book images-${Math.min(work.images.length, 3)}`}>
            {work.images.slice(0, 3).map((image, index) => (
              <figure key={image.id} className={index === 0 ? "portfolio-cover" : "portfolio-detail"}>
                <img src={image.url} alt={image.alt} loading="lazy" />
              </figure>
            ))}
          </div>
          <div className="portfolio-copy">
            <div className="portfolio-meta">
              <span>{work.rubro === "electricidad" ? "Electricidad" : "Climatización"}</span>
              {work.localidad_publica && <small>{work.localidad_publica}</small>}
            </div>
            <h3>{work.titulo_publico}</h3>
            <p>{work.resumen}</p>
            {work.review && <blockquote>
              <span aria-label={`${work.review.puntuacion} de 5 estrellas`}>{"★".repeat(work.review.puntuacion)}{"☆".repeat(5 - work.review.puntuacion)}</span>
              <p>“{work.review.comentario}”</p>
              <cite>{work.review.nombre_publico}</cite>
            </blockquote>}
          </div>
        </article>
      ))}
    </div>}

    {!loading && filtered.length === 0 && <div className="portfolio-empty">
      <span>MC</span>
      <h3>Un book hecho con trabajos reales.</h3>
      <p>Estamos preparando los primeros casos. Cada publicación tendrá hasta tres fotos del trabajo y, cuando el cliente lo autorice, su experiencia verificada.</p>
    </div>}
  </>;
}
