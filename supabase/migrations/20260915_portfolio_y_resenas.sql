-- MetroClima · portfolio de trabajos y reseñas verificadas
-- Cada reseña nace desde el token único incluido en el presupuesto.

alter table public.presupuestos
  add column if not exists rubro text not null default 'climatizacion'
    check (rubro in ('climatizacion', 'electricidad')),
  add column if not exists review_token uuid not null default gen_random_uuid();

create unique index if not exists presupuestos_review_token_idx
  on public.presupuestos (review_token);

create table if not exists public.trabajos (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id uuid not null unique references public.presupuestos(id) on delete cascade,
  titulo_publico text not null check (char_length(titulo_publico) between 6 and 140),
  resumen text not null check (char_length(resumen) between 20 and 1200),
  localidad_publica text check (localidad_publica is null or char_length(localidad_publica) <= 100),
  fecha_realizacion date,
  publicado boolean not null default false,
  destacado boolean not null default false,
  creado_por uuid not null references public.perfiles(id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.trabajo_imagenes (
  id uuid primary key default gen_random_uuid(),
  trabajo_id uuid not null references public.trabajos(id) on delete cascade,
  storage_path text not null unique,
  orden smallint not null check (orden between 1 and 3),
  alt text not null check (char_length(alt) between 6 and 180),
  creado_en timestamptz not null default now(),
  unique (trabajo_id, orden)
);

create table if not exists public.resenas_clientes (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id uuid not null unique references public.presupuestos(id) on delete cascade,
  nombre_publico text not null default 'Cliente de MetroClima'
    check (char_length(nombre_publico) between 2 and 60),
  puntuacion smallint not null check (puntuacion between 1 and 5),
  comentario text not null check (char_length(comentario) between 20 and 1000),
  review_token uuid not null,
  aprobada boolean not null default false,
  moderada_por uuid references public.perfiles(id),
  moderada_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists trabajos_publicados_idx
  on public.trabajos (publicado, destacado desc, fecha_realizacion desc);
create index if not exists trabajo_imagenes_trabajo_idx
  on public.trabajo_imagenes (trabajo_id, orden);
create index if not exists resenas_aprobadas_idx
  on public.resenas_clientes (aprobada, creado_en desc);
create index if not exists trabajos_creado_por_idx
  on public.trabajos (creado_por);
create index if not exists resenas_moderada_por_idx
  on public.resenas_clientes (moderada_por);

drop trigger if exists trabajos_actualizado_en on public.trabajos;
create trigger trabajos_actualizado_en before update on public.trabajos
for each row execute function private.actualizar_fecha_modificacion();

drop trigger if exists resenas_actualizado_en on public.resenas_clientes;
create trigger resenas_actualizado_en before update on public.resenas_clientes
for each row execute function private.actualizar_fecha_modificacion();

create or replace function private.token_presupuesto_valido(
  presupuesto uuid,
  token uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.presupuestos p
    where p.id = presupuesto and p.review_token = token
  );
$$;

revoke all on function private.token_presupuesto_valido(uuid, uuid)
from public, anon, authenticated;
grant usage on schema private to anon, authenticated;
grant execute on function private.token_presupuesto_valido(uuid, uuid)
to anon, authenticated;

alter table public.trabajos enable row level security;
alter table public.trabajo_imagenes enable row level security;
alter table public.resenas_clientes enable row level security;

revoke all on public.trabajos from public, anon, authenticated;
revoke all on public.trabajo_imagenes from public, anon, authenticated;
revoke all on public.resenas_clientes from public, anon, authenticated;

grant select (id, presupuesto_id, titulo_publico, resumen, localidad_publica,
  fecha_realizacion, publicado, destacado, creado_en)
on public.trabajos to anon, authenticated;
grant select (id, trabajo_id, storage_path, orden, alt, creado_en)
on public.trabajo_imagenes to anon, authenticated;
grant select (id, presupuesto_id, nombre_publico, puntuacion, comentario,
  aprobada, creado_en)
on public.resenas_clientes to anon, authenticated;
grant insert (presupuesto_id, nombre_publico, puntuacion, comentario, review_token)
on public.resenas_clientes to anon, authenticated;

grant insert, update, delete on public.trabajos to authenticated;
grant insert, update, delete on public.trabajo_imagenes to authenticated;
grant update, delete on public.resenas_clientes to authenticated;

create policy "publico ve trabajos publicados"
on public.trabajos for select
to anon
using (publicado = true);

create policy "administradores gestionan trabajos"
on public.trabajos for all
to authenticated
using (private.es_admin())
with check (private.es_admin());

create policy "publico ve imagenes publicadas"
on public.trabajo_imagenes for select
to anon
using (
  exists (
    select 1 from public.trabajos t
    where t.id = trabajo_id and t.publicado = true
  )
);

create policy "administradores gestionan imagenes"
on public.trabajo_imagenes for all
to authenticated
using (private.es_admin())
with check (private.es_admin());

create policy "publico ve resenas aprobadas"
on public.resenas_clientes for select
to anon
using (
  aprobada = true
  and exists (
    select 1 from public.trabajos t
    where t.presupuesto_id = resenas_clientes.presupuesto_id
      and t.publicado = true
  )
);

create policy "cliente envia resena con token"
on public.resenas_clientes for insert
to anon
with check (
  aprobada = false
  and moderada_por is null
  and moderada_en is null
  and private.token_presupuesto_valido(presupuesto_id, review_token)
);

create policy "administradores gestionan resenas"
on public.resenas_clientes for all
to authenticated
using (private.es_admin())
with check (private.es_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trabajos',
  'trabajos',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "administradores gestionan fotos de trabajos"
on storage.objects for all
to authenticated
using (bucket_id = 'trabajos' and private.es_admin())
with check (bucket_id = 'trabajos' and private.es_admin());
