-- App data snapshot for cross-device sync (Phase 2 of the Postgres sync
-- plan). One row per business/workspace holds the entire zustand store
-- state as JSON. A single fixed row ("main") is enough since this app is
-- used by one business — every logged-in user reads/writes the same row,
-- which is exactly what "shared live data" means for this use case.
create table if not exists app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
