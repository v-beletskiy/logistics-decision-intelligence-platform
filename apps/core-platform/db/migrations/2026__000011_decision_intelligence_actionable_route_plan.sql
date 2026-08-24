CREATE TABLE IF NOT EXISTS decision_intelligence.recommendation_route_plan_stops (
  tenant_id uuid NOT NULL,
  recommendation_id uuid NOT NULL,
  route_stop_id uuid NOT NULL,
  sequence integer NOT NULL CHECK (sequence > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, recommendation_id, route_stop_id),
  CONSTRAINT recommendation_route_plan_stops_sequence_unique
    UNIQUE (tenant_id, recommendation_id, sequence),
  CONSTRAINT recommendation_route_plan_stops_recommendation_fk
    FOREIGN KEY (tenant_id, recommendation_id)
    REFERENCES decision_intelligence.recommendations (tenant_id, id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS recommendation_route_plan_stops_tenant_recommendation_idx
  ON decision_intelligence.recommendation_route_plan_stops (tenant_id, recommendation_id, sequence);

ALTER TABLE shared.integration_inbox
  ADD COLUMN IF NOT EXISTS status text;

ALTER TABLE shared.integration_inbox
  ADD COLUMN IF NOT EXISTS locked_until timestamptz;

UPDATE shared.integration_inbox
SET
  status = CASE WHEN processed_at IS NULL THEN 'PROCESSING' ELSE 'COMPLETED' END,
  locked_until = CASE WHEN processed_at IS NULL THEN now() ELSE NULL END
WHERE status IS NULL;

ALTER TABLE shared.integration_inbox
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE shared.integration_inbox
  ADD CONSTRAINT integration_inbox_status_check
  CHECK (status IN ('PROCESSING', 'COMPLETED'));

CREATE INDEX IF NOT EXISTS integration_inbox_processing_idx
  ON shared.integration_inbox (locked_until)
  WHERE status = 'PROCESSING';
