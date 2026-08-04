CREATE SCHEMA IF NOT EXISTS shared;
CREATE SCHEMA IF NOT EXISTS operational_workspace;
CREATE SCHEMA IF NOT EXISTS decision_intelligence;

CREATE TABLE IF NOT EXISTS shared.integration_outbox (
  event_id uuid PRIMARY KEY,
  event_type text NOT NULL,
  event_version integer NOT NULL,
  occurred_at timestamptz NOT NULL,
  tenant_id uuid NOT NULL,
  initiated_by_user_id uuid,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz,
  -- Changes on every claim so stale publishers cannot update a newer claim.
  lock_token uuid,
  published_at timestamptz,
  last_error text,
  CONSTRAINT integration_outbox_status_check
    CHECK (status IN ('PENDING', 'PROCESSING', 'PUBLISHED'))
);

CREATE INDEX IF NOT EXISTS integration_outbox_pending_idx
  ON shared.integration_outbox (available_at, occurred_at)
  WHERE status IN ('PENDING', 'PROCESSING');

CREATE TABLE IF NOT EXISTS shared.integration_inbox (
  event_id uuid PRIMARY KEY,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
