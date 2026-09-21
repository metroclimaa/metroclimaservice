alter table public.presupuestos
  add column modalidad text not null default 'simple'
    check (modalidad in ('simple', 'comparativo')),
  add column observaciones text
    check (observaciones is null or char_length(observaciones) <= 4000),
  add column render_path text
    check (render_path is null or char_length(render_path) <= 500),
  add column subtotal_mano_obra_high numeric not null default 0
    check (subtotal_mano_obra_high >= 0),
  add column subtotal_materiales_high numeric not null default 0
    check (subtotal_materiales_high >= 0),
  add column iva_high numeric not null default 0
    check (iva_high >= 0),
  add column total_high numeric not null default 0
    check (total_high >= 0);

alter table public.items_presupuesto
  add column alternativa text not null default 'simple'
    check (alternativa in ('simple', 'low', 'high'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'presupuesto-renders',
  'presupuesto-renders',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Administradores leen renders de presupuestos"
on storage.objects for select to authenticated
using (bucket_id = 'presupuesto-renders' and (select private.es_admin()));

create policy "Administradores cargan renders de presupuestos"
on storage.objects for insert to authenticated
with check (bucket_id = 'presupuesto-renders' and (select private.es_admin()));

create policy "Administradores actualizan renders de presupuestos"
on storage.objects for update to authenticated
using (bucket_id = 'presupuesto-renders' and (select private.es_admin()))
with check (bucket_id = 'presupuesto-renders' and (select private.es_admin()));

create policy "Administradores eliminan renders de presupuestos"
on storage.objects for delete to authenticated
using (bucket_id = 'presupuesto-renders' and (select private.es_admin()));

create index items_presupuesto_alternativa_idx
  on public.items_presupuesto (presupuesto_id, alternativa, orden);
