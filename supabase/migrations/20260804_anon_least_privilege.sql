revoke all on public.admin_emails_permitidos from anon;
revoke all on public.perfiles from anon;
revoke all on public.respuestas from anon;
revoke all on public.clientes from anon;
revoke all on public.materiales from anon;
revoke all on public.presupuestos from anon;
revoke all on public.items_presupuesto from anon;
revoke all on public.comprobantes from anon;

grant select on public.respuestas to anon;
