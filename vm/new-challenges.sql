-- ============================================================
--  New challenges — run in Supabase SQL Editor
--  Adds 4 Medium + 2 Hard challenges
-- ============================================================

insert into challenges (id, name, points, flag_hash) values
  ('cron-job',     'cron_job',     150,
    encode(digest('flag{cr0n_p3rs1st3nc3_d3t3ct3d}',      'sha256'), 'hex')),
  ('shadow-walk',  'shadow_walk',  175,
    encode(digest('flag{su1d_b1t_3sc4l4t10n}',             'sha256'), 'hex')),
  ('env-harvest',  'env_harvest',  175,
    encode(digest('flag{s3cr3ts_1n_pl41n_s1ght}',          'sha256'), 'hex')),
  ('pivot-chain',  'pivot_chain',  200,
    encode(digest('flag{ssh_k3y_ch41n_unl0ck3d}',          'sha256'), 'hex')),
  ('blind-sqli',   'blind_sqli',   250,
    encode(digest('flag{bl1nd_1nj3ct10n_p4yl04d}',         'sha256'), 'hex')),
  ('kernel-rx',    'kernel_rx',    300,
    encode(digest('flag{k3rn3l_m0dul3_c2_3xtr4ct3d}',      'sha256'), 'hex'))
on conflict (id) do nothing;
