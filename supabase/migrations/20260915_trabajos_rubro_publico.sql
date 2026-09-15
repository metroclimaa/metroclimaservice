-- El rubro público se copia automáticamente desde el presupuesto. Esto evita
-- exponer la tabla privada de presupuestos en el book y no agrega carga manual.

alter table public.trabajos
  add column if not exists rubro text not null default 'climatizacion'
  check (rubro in ('climatizacion', 'electricidad'));

update public.trabajos t
set rubro = p.rubro
from public.presupuestos p
where p.id = t.presupuesto_id and t.rubro is distinct from p.rubro;

create or replace function private.sincronizar_rubro_trabajo()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  select p.rubro into new.rubro
  from public.presupuestos p
  where p.id = new.presupuesto_id;
  return new;
end;
$$;

drop trigger if exists sincronizar_rubro_trabajo on public.trabajos;
create trigger sincronizar_rubro_trabajo
before insert or update of presupuesto_id on public.trabajos
for each row execute function private.sincronizar_rubro_trabajo();

revoke all on function private.sincronizar_rubro_trabajo()
from public, anon, authenticated;
grant execute on function private.sincronizar_rubro_trabajo() to authenticated;

grant select (rubro) on public.trabajos to anon, authenticated;
