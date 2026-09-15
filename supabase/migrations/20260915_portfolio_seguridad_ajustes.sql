-- Ajustes posteriores al control de Advisors.
-- La página de experiencia recibe presupuesto + token en el QR, por lo que no
-- necesita una función SECURITY DEFINER expuesta mediante la Data API.

drop function if exists public.obtener_experiencia(uuid);

drop policy if exists "publico ve trabajos publicados" on public.trabajos;
create policy "publico ve trabajos publicados"
on public.trabajos for select to anon
using (publicado = true);

drop policy if exists "publico ve imagenes publicadas" on public.trabajo_imagenes;
create policy "publico ve imagenes publicadas"
on public.trabajo_imagenes for select to anon
using (
  exists (
    select 1 from public.trabajos t
    where t.id = trabajo_id and t.publicado = true
  )
);

drop policy if exists "publico ve resenas aprobadas" on public.resenas_clientes;
create policy "publico ve resenas aprobadas"
on public.resenas_clientes for select to anon
using (
  aprobada = true
  and exists (
    select 1 from public.trabajos t
    where t.presupuesto_id = resenas_clientes.presupuesto_id
      and t.publicado = true
  )
);

drop policy if exists "cliente envia resena con token" on public.resenas_clientes;
create policy "cliente envia resena con token"
on public.resenas_clientes for insert to anon
with check (
  aprobada = false
  and moderada_por is null
  and moderada_en is null
  and private.token_presupuesto_valido(presupuesto_id, review_token)
);

create index if not exists trabajos_creado_por_idx
  on public.trabajos (creado_por);
create index if not exists resenas_moderada_por_idx
  on public.resenas_clientes (moderada_por);
