-- Allow admins to dismiss (delete) reports
create policy "Admins can delete reports" on public.reports
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
