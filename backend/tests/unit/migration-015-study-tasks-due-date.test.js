import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migration = readFileSync(
  join(__dirname, '../../../supabase/migrations/015_study_tasks_due_date.sql'),
  'utf8'
);

describe('migration 015 study_tasks due_date', () => {
  it('adds only due_date date null column', () => {
    assert.match(migration, /alter table public\.study_tasks\s+add column due_date date null;/i);
    assert.doesNotMatch(migration, /create table/i);
    assert.doesNotMatch(migration, /\bdefault\b/i);
  });

  it('documents optional user-set calendar due date', () => {
    assert.match(migration, /comment on column public\.study_tasks\.due_date is/i);
    assert.match(migration, /NULL means no deadline/i);
  });

  it('does not change RLS', () => {
    assert.doesNotMatch(migration, /row level security/i);
    assert.doesNotMatch(migration, /create policy/i);
    assert.doesNotMatch(migration, /enable row level security/i);
  });

  it('does not add an index', () => {
    assert.doesNotMatch(migration, /create index/i);
  });

  it('does not backfill rows', () => {
    assert.doesNotMatch(migration, /update\s+public\.study_tasks/i);
    assert.doesNotMatch(migration, /insert\s+into\s+public\.study_tasks/i);
  });

  it('does not add triggers or additional tables', () => {
    assert.doesNotMatch(migration, /create trigger/i);
    assert.doesNotMatch(migration, /create table/i);
  });
});
