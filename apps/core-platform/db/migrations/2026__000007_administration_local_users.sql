CREATE SCHEMA IF NOT EXISTS administration;

CREATE TABLE IF NOT EXISTS administration.users (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL CHECK (btrim(password_hash) <> ''),
  roles text[] NOT NULL CHECK (
    cardinality(roles) > 0
    AND roles <@ ARRAY['ADMINISTRATOR', 'DISPATCHER', 'PLANNER']::text[]
  ),
  active boolean NOT NULL DEFAULT true,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_normalized_check CHECK (
    email = lower(btrim(email))
    AND char_length(email) BETWEEN 3 AND 254
  ),
  CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS users_tenant_active_idx
  ON administration.users (tenant_id, id)
  WHERE active;
