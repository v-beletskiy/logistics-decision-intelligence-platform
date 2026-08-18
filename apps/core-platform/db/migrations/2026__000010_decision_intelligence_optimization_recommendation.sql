CREATE TABLE
  IF NOT EXISTS decision_intelligence.optimizations (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL,
    route_id uuid NOT NULL,
    status text NOT NULL CHECK (
      status IN (
        'QUEUED',
        'RUNNING',
        'COMPLETED',
        'CANCELLED',
        'FAILED'
      )
    ),
    input_version integer CHECK (input_version > 0),
    revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT optimizations_tenant_id_unique UNIQUE (tenant_id, id)
  );

CREATE INDEX IF NOT EXISTS optimizations_tenant_route_idx ON decision_intelligence.optimizations (tenant_id, route_id);

CREATE INDEX IF NOT EXISTS optimizations_tenant_active_route_idx ON decision_intelligence.optimizations (tenant_id, route_id)
WHERE
  status IN ('QUEUED', 'RUNNING');

CREATE TABLE
  IF NOT EXISTS decision_intelligence.recommendations (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL,
    route_id uuid NOT NULL,
    optimization_id uuid NOT NULL,
    type text NOT NULL CHECK (
      type IN (
        'ASSIGN_VEHICLE',
        'ASSIGN_DRIVER',
        'OPTIMIZE_ROUTE_PLAN',
        'SPLIT_SHIPMENT',
        'CONSOLIDATE_SHIPMENTS'
      )
    ),
    status text NOT NULL CHECK (
      status IN (
        'PENDING',
        'ACCEPTED',
        'REJECTED',
        'EXPIRED'
      )
    ),
    summary text,
    confidence double precision CHECK (
      confidence >= 0
      AND confidence <= 100
    ),
    score double precision NOT NULL,
    revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT recommendations_tenant_id_unique UNIQUE (tenant_id, id),
    CONSTRAINT recommendations_optimization_fk FOREIGN KEY (tenant_id, optimization_id) REFERENCES decision_intelligence.optimizations (tenant_id, id) ON DELETE CASCADE
  );

CREATE INDEX IF NOT EXISTS recommendations_tenant_route_status_idx ON decision_intelligence.recommendations (tenant_id, route_id, status);

CREATE INDEX IF NOT EXISTS recommendations_tenant_status_idx ON decision_intelligence.recommendations (tenant_id, status, id);

CREATE TABLE
  IF NOT EXISTS decision_intelligence.recommendation_facts (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    recommendation_id uuid NOT NULL,
    metric text NOT NULL CHECK (
      metric IN (
        'TOTAL_DISTANCE',
        'TOTAL_DURATION',
        'FUEL_CONSUMPTION',
        'ESTIMATED_ARRIVAL',
        'ESTIMATED_COST',
        'DRIVER_UTILIZATION',
        'VEHICLE_UTILIZATION'
      )
    ),
    baseline_value double precision NOT NULL,
    recommended_value double precision NOT NULL,
    unit text NOT NULL CHECK (
      unit IN (
        'KILOMETERS',
        'SECONDS',
        'LITERS',
        'KILOGRAMS',
        'CUBIC_METERS',
        'CURRENCY',
        'PERCENTAGE',
        'COUNT',
        'SCORE'
      )
    ),
    improvement double precision NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now (),
    PRIMARY KEY (tenant_id, recommendation_id, id),
    CONSTRAINT recommendation_facts_recommendation_fk FOREIGN KEY (tenant_id, recommendation_id) REFERENCES decision_intelligence.recommendations (tenant_id, id) ON DELETE CASCADE
  );

CREATE INDEX IF NOT EXISTS recommendation_facts_tenant_recommendation_idx ON decision_intelligence.recommendation_facts (tenant_id, recommendation_id);

CREATE TABLE
  IF NOT EXISTS decision_intelligence.recommendation_findings (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    recommendation_id uuid NOT NULL,
    category text NOT NULL CHECK (
      category IN (
        'STRENGTH',
        'RISK',
        'ASSUMPTION'
      )
    ),
    title text NOT NULL CHECK (btrim (title) <> ''),
    description text NOT NULL CHECK (btrim (description) <> ''),
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now (),
    PRIMARY KEY (tenant_id, recommendation_id, id),
    CONSTRAINT recommendation_findings_recommendation_fk FOREIGN KEY (tenant_id, recommendation_id) REFERENCES decision_intelligence.recommendations (tenant_id, id) ON DELETE CASCADE
  );

CREATE INDEX IF NOT EXISTS recommendation_findings_tenant_recommendation_idx ON decision_intelligence.recommendation_findings (tenant_id, recommendation_id);