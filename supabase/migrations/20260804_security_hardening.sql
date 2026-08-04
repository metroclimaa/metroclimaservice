create schema if not exists private;

alter function public.actualizar_fecha_modificacion() set schema private;
alter function public.es_admin() set schema private;
alter function public.vincular_admin_permitido() set schema private;

revoke all on function private.es_admin() from public, anon;
revoke all on function private.vincular_admin_permitido() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.es_admin() to authenticated;

revoke all on function public.rls_auto_enable() from public, anon, authenticated;

revoke all on public.admin_emails_permitidos from anon;
revoke all on public.perfiles from anon;
revoke all on public.respuestas from anon;
revoke all on public.clientes from anon;
revoke all on public.materiales from anon;
revoke all on public.presupuestos from anon;
revoke all on public.items_presupuesto from anon;
revoke all on public.comprobantes from anon;
grant select on public.respuestas to anon;

drop policy if exists "usuario ve su perfil" on public.perfiles;

drop policy if exists "publico ve respuestas publicas" on public.respuestas;
create policy "publico ve respuestas publicas"
on public.respuestas for select
to anon
using (publica = true);

grant select (id, categoria, titulo, consulta, nombre_publico, creado_en)
on public.consultas to anon;

create policy "publico ve consultas publicas"
on public.consultas for select
to anon
using (visible_publicamente = true and estado <> 'archivada');

alter view public.consultas_publicas set (security_invoker = true);

create index respuestas_autor_idx on public.respuestas (autor_id);
create index items_presupuesto_presupuesto_idx on public.items_presupuesto (presupuesto_id);
create index items_presupuesto_material_idx on public.items_presupuesto (material_id);
create index presupuestos_creado_por_idx on public.presupuestos (creado_por);
create index comprobantes_presupuesto_idx on public.comprobantes (presupuesto_id);
create index comprobantes_responsable_idx on public.comprobantes (responsable_id);
