-- Backfill creator profile completion for existing rows
update creators
set profile_complete = true
where profile_complete = false
  and display_name is not null
  and slug is not null;
