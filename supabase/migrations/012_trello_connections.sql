-- StudyOps AI — Phase TRELLO-OAUTH-A2-DB: public.trello_connections + RLS + Data API grants
-- Scope: encrypted Trello user token storage for backend OAuth/connect (later phases).
-- Never stores plaintext Trello token — AES-256-GCM ciphertext + iv + tag only.
-- Prerequisite: migrations 001–011 applied.
-- Not in this phase: connect/disconnect HTTP routes, frontend callback, changes to manual /api/trello/* sync.
-- Do not re-apply on environments where public.trello_connections already exists.

-- =============================================================================
-- Table: public.trello_connections
-- One Trello link per user. Backend (service_role) only — no client access to token columns.
-- =============================================================================

create table public.trello_connections (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  token_ciphertext      text not null,
  token_iv              text not null,
  token_tag             text not null,
  encryption_key_version smallint not null default 1,
  scopes                text not null,
  expiration_policy     text,
  expires_at            timestamptz,
  trello_member_id      text not null,
  trello_username       text,
  default_board_id      text,
  default_list_id       text,
  connected_at          timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint trello_connections_user_id_unique unique (user_id)
);

comment on table public.trello_connections is
  'Per-user Trello OAuth token storage (encrypted). Backend service_role only; disconnect hard-deletes row (later phase).';

comment on column public.trello_connections.user_id is
  'Owner; one connection per user. Same uuid as auth.uid().';

comment on column public.trello_connections.token_ciphertext is
  'AES-256-GCM ciphertext (base64). Plaintext Trello token must never be stored.';

comment on column public.trello_connections.token_iv is
  'AES-256-GCM nonce/IV (base64).';

comment on column public.trello_connections.token_tag is
  'AES-256-GCM authentication tag (base64).';

comment on column public.trello_connections.encryption_key_version is
  'Key version for rotation via TRELLO_TOKEN_ENCRYPTION_KEY (backend env).';

comment on column public.trello_connections.scopes is
  'Comma-separated scopes granted at connect (e.g. read,write).';

comment on column public.trello_connections.expiration_policy is
  'Trello authorize expiration param (e.g. never, 30days).';

comment on column public.trello_connections.expires_at is
  'Optional expiry timestamp if policy implies expiration.';

comment on column public.trello_connections.trello_member_id is
  'Trello member id from /members/me after connect.';

comment on column public.trello_connections.trello_username is
  'Optional display username; not email unless account scope added later.';

comment on column public.trello_connections.default_board_id is
  'Optional UX default board id (non-secret).';

comment on column public.trello_connections.default_list_id is
  'Optional UX default list id (non-secret).';

create index trello_connections_user_id_idx
  on public.trello_connections (user_id);

-- =============================================================================
-- Trigger: maintain updated_at on row update
-- =============================================================================

create or replace function public.set_trello_connections_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trello_connections_set_updated_at
  before update on public.trello_connections
  for each row
  execute function public.set_trello_connections_updated_at();

-- =============================================================================
-- Row Level Security
-- No policies for authenticated — frontend must not read/write token data via PostgREST.
-- service_role bypasses RLS — backend must always filter by user_id.
-- =============================================================================

alter table public.trello_connections enable row level security;

-- =============================================================================
-- Data API grants (required when "Automatically expose new tables" is OFF)
-- GRANT = role may access table via PostgREST; RLS = which rows are allowed.
-- =============================================================================

revoke all on table public.trello_connections from anon;
revoke all on table public.trello_connections from authenticated;
revoke all on table public.trello_connections from service_role;

grant select, insert, update, delete
  on table public.trello_connections
  to service_role;
