-- treatme v1 supabase schema
-- run in the supabase sql editor. requires pgcrypto for gen_random_uuid.

create extension if not exists "pgcrypto";

-- one row per auth user. is_premium gates unlimited scans.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

-- one row per completed skin analysis.
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  scores jsonb not null,
  explanations jsonb not null,
  top_priorities text[] not null default '{}',
  summary text not null default '',
  fitzpatrick text,
  email text,
  photo_count int not null default 0
);

create index if not exists scans_user_created_idx
  on public.scans (user_id, created_at desc);

-- row level security: users only ever see their own rows.
alter table public.profiles enable row level security;
alter table public.scans enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own scans" on public.scans;
create policy "own scans" on public.scans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
