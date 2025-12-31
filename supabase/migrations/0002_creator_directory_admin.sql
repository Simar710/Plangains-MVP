-- Creator directory + admin controls
alter table creators add column if not exists is_active boolean not null default true;
alter table creators add column if not exists profile_complete boolean not null default false;
alter table creators add column if not exists avatar_url text;

update creators set is_active = true where is_active is null;
update creators set profile_complete = true where profile_complete is null;

create policy "Admin can update creators" on creators
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );
