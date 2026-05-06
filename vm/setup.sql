-- ============================================================
--  CTF Leaderboard — run this in Supabase SQL Editor once
-- ============================================================

-- 1. pgcrypto for SHA-256 flag hashing
create extension if not exists pgcrypto;

-- 2. User profiles (public username)
create table if not exists profiles (
  id         uuid references auth.users on delete cascade primary key,
  username   text unique not null
               check (char_length(username) between 3 and 20
                      and username ~ '^[a-zA-Z0-9_-]+$'),
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Profiles are public"          on profiles for select using (true);
create policy "Users insert own profile"     on profiles for insert with check (auth.uid() = id);
create policy "Users update own profile"     on profiles for update using (auth.uid() = id);

-- 3. Challenges — flag_hash only, users can never read flags directly
create table if not exists challenges (
  id         text primary key,
  name       text not null,
  points     int  not null,
  flag_hash  text not null   -- SHA-256 hex of the flag string
);
alter table challenges enable row level security;
-- intentionally no SELECT policy → no direct access

-- 4. Solves — who solved what
create table if not exists solves (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users on delete cascade not null,
  challenge_id text references challenges(id) not null,
  solved_at    timestamptz default now(),
  unique(user_id, challenge_id)
);
alter table solves enable row level security;
create policy "Solves are public"          on solves for select using (true);
create policy "Users insert own solves"    on solves for insert with check (auth.uid() = user_id);

-- 5. Leaderboard view (public)
create or replace view leaderboard as
select
  p.id       as user_id,
  p.username,
  coalesce(sum(c.points), 0)::int  as total_points,
  count(s.challenge_id)::int       as solves_count
from profiles p
left join solves s     on s.user_id     = p.id
left join challenges c on c.id          = s.challenge_id
group by p.id, p.username
order by total_points desc;

grant select on leaderboard to anon, authenticated;

-- 6. submit_flag(p_flag text) → json
--    Runs as DB owner (security definer) so it can read challenge hashes
create or replace function submit_flag(p_flag text)
returns json
language plpgsql
security definer
as $$
declare
  v_hash      text;
  v_challenge challenges%rowtype;
  v_already   boolean;
begin
  if auth.uid() is null then
    return json_build_object('success', false, 'message', 'Not authenticated');
  end if;

  v_hash := encode(digest(trim(p_flag), 'sha256'), 'hex');
  select * into v_challenge from challenges where flag_hash = v_hash limit 1;

  if v_challenge.id is null then
    return json_build_object('success', false, 'message', 'Incorrect flag');
  end if;

  select exists(
    select 1 from solves
    where user_id = auth.uid() and challenge_id = v_challenge.id
  ) into v_already;

  if v_already then
    return json_build_object('success', false, 'message', 'Already solved: ' || v_challenge.name);
  end if;

  insert into solves (user_id, challenge_id) values (auth.uid(), v_challenge.id);

  return json_build_object(
    'success',        true,
    'message',        'Correct! +' || v_challenge.points || ' pts — ' || v_challenge.name,
    'points',         v_challenge.points,
    'challenge_name', v_challenge.name
  );
end;
$$;

grant execute on function submit_flag to authenticated;

-- 7. Seed challenge flag hashes
--    Flags are hashed here so they never appear in client code
insert into challenges (id, name, points, flag_hash) values
  ('init-flag-1',      'init.flag (flag 1/2)', 13,
    encode(digest('flag{b4se64_1s_th3_beginn1ng}',         'sha256'), 'hex')),
  ('init-flag-2',      'init.flag (flag 2/2)', 12,
    encode(digest('flag{f1nd_3v3ryth1ng_1n_th3_f1l3syst3m}','sha256'), 'hex')),
  ('file-magic',       'file_magic',            50,
    encode(digest('flag{m4g1c_byt3s_n3v3r_l13}',           'sha256'), 'hex')),
  ('strings-attached', 'strings_attached',      60,
    encode(digest('flag{str1ngs_r3v34l_s3cr3ts}',          'sha256'), 'hex')),
  ('log-trace',        'log_trace',             75,
    encode(digest('flag{10.13.37.99_CVE-2021-44228_dns}',  'sha256'), 'hex')),
  ('hash-hunt',        'hash_hunt',             100,
    encode(digest('flag{alice_123456_charlie_reuse}',       'sha256'), 'hex')),
  ('time-line',        'time_line',             125,
    encode(digest('flag{t1m3st4mps_t3ll_4ll}',             'sha256'), 'hex'))
on conflict (id) do nothing;

-- ============================================================
--  IMPORTANT: In Supabase Dashboard → Authentication → Settings
--  Disable "Enable email confirmations" for instant signup.
-- ============================================================
