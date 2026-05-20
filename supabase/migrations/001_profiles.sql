-- StudyOps AI — Phase 1C: public.profiles + RLS + signup trigger
-- DRAFT: Not applied to any Supabase project until human approval to run.
-- Scope: profiles table only. No courses, auth routes, or other tables.

-- =============================================================================
-- Table: public.profiles
-- profiles.id is the Supabase Auth user id (PK = FK to auth.users).
-- Future tables use user_id where user_id = auth.uid() = profiles.id.
-- =============================================================================

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  role        text not null default 'student'
              check (role in ('student', 'admin')),
  created_at  timestamptz not null default now()
);

comment on table public.profiles is
  'App profile per auth user. id = auth.users.id. role: student (default) or admin (manual only).';

comment on column public.profiles.id is 'Supabase Auth user id; same as auth.uid() and future user_id on other tables.';

create index profiles_role_idx on public.profiles (role);

-- =============================================================================
-- Row Level Security (Phase 1C: SELECT own row only)
-- No INSERT / UPDATE / DELETE policies for clients.
-- =============================================================================

alter table public.profiles enable row level security;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- =============================================================================
-- Trigger: create profile on auth signup (always role = student)
-- Admin promotion: manual via dashboard / SQL / service role only.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'student');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
