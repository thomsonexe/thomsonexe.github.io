-- ============================================================
--  Profile update — run in Supabase SQL Editor
-- ============================================================

-- Add bio + avatar columns to profiles
alter table profiles
  add column if not exists bio        text check (char_length(bio) <= 160),
  add column if not exists avatar_url text;

-- Drop and recreate leaderboard view with avatar_url column
drop view if exists leaderboard;

create view leaderboard as
select
  p.id         as user_id,
  p.username,
  p.avatar_url,
  coalesce(sum(c.points), 0)::int  as total_points,
  count(s.challenge_id)::int       as solves_count
from profiles p
left join solves s     on s.user_id = p.id
left join challenges c on c.id     = s.challenge_id
group by p.id, p.username, p.avatar_url
order by total_points desc;

grant select on leaderboard to anon, authenticated;

-- Storage bucket for avatars (public read)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]);
