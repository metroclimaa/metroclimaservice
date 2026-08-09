create table public.analiticas_eventos (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view', 'whatsapp_click', 'budget_click', 'service_interest')),
  session_id uuid not null,
  pathname text not null check (char_length(pathname) between 1 and 160),
  source text not null default 'directo' check (char_length(source) between 1 and 80),
  device_type text not null check (device_type in ('celular', 'tablet', 'computadora')),
  label text check (label is null or char_length(label) between 1 and 120),
  created_at timestamptz not null default now()
);

alter table public.analiticas_eventos enable row level security;

revoke all on public.analiticas_eventos from public, anon, authenticated;
grant insert (event_type, session_id, pathname, source, device_type, label)
on public.analiticas_eventos to anon;
grant select on public.analiticas_eventos to authenticated;

create policy "publico registra analitica limitada"
on public.analiticas_eventos for insert
to anon
with check (
  event_type in ('page_view', 'whatsapp_click', 'budget_click', 'service_interest')
  and pathname !~ '^/(panel|ingreso)'
);

create policy "administradores ven analitica"
on public.analiticas_eventos for select
to authenticated
using (private.es_admin());

create index analiticas_eventos_created_idx
on public.analiticas_eventos (created_at desc);
create index analiticas_eventos_type_created_idx
on public.analiticas_eventos (event_type, created_at desc);
create index analiticas_eventos_session_created_idx
on public.analiticas_eventos (session_id, created_at desc);
