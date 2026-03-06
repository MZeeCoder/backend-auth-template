-- ============================================================================
-- COMPLETE MIGRATION: Users Table + Avatar Storage + Auth Sync
-- ============================================================================

-- 1. EXTENSIONS & TABLES
-- Ensure the users table exists and is linked to Supabase Auth
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null unique,
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_length check (char_length(username) >= 3)
);

-- 2. FUNCTIONS
-- Function to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Function to sync Auth users to Public users with default avatars
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_username text;
begin
  default_username := coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1));

  insert into public.users (id, username, email, avatar)
  values (
    new.id,
    default_username,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'avatar',
      'https://ui-avatars.com/api/?name=' || upper(left(default_username, 1)) || '&background=0D8ABC&color=fff&size=256'
    )
  )
  on conflict (id) do update set
    username = excluded.username,
    email = excluded.email,
    avatar = excluded.avatar,
    updated_at = now();

  return new;
end;
$$;

-- 3. TRIGGERS
-- Trigger for updated_at
drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

-- Trigger for auth sync
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- 4. ROW LEVEL SECURITY (RLS) - PUBLIC.USERS
alter table public.users enable row level security;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 5. STORAGE BUCKET SETUP
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  20971520, -- 20MB
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 6. STORAGE POLICIES
drop policy if exists "Avatar public read" on storage.objects;
create policy "Avatar public read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "Avatar owner CRUD" on storage.objects;
create policy "Avatar owner CRUD"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'avatars' 
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 7. BACKFILL & CLEANUP
-- Backfill default avatars for existing users missing them
update public.users
set avatar = 'https://ui-avatars.com/api/?name=' || upper(left(username, 1)) || '&background=0D8ABC&color=fff&size=256',
    updated_at = now()
where avatar is null or btrim(avatar) = '';
