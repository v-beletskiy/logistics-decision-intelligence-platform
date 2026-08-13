CREATE TABLE
  IF NOT EXISTS operational_workspace.shipments (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL,
    status text NOT NULL CHECK (
      status IN ('CREATED', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    ),
    pickup_completed boolean NOT NULL DEFAULT false,
    delivery_completed boolean NOT NULL DEFAULT false,
    pickup_country text NOT NULL,
    pickup_state_or_region text,
    pickup_city text NOT NULL,
    pickup_street text NOT NULL,
    pickup_building_number text NOT NULL,
    pickup_postal_code text NOT NULL,
    pickup_start_at timestamptz NOT NULL,
    pickup_end_at timestamptz NOT NULL,
    delivery_country text NOT NULL,
    delivery_state_or_region text,
    delivery_city text NOT NULL,
    delivery_street text NOT NULL,
    delivery_building_number text NOT NULL,
    delivery_postal_code text NOT NULL,
    delivery_start_at timestamptz NOT NULL,
    delivery_end_at timestamptz NOT NULL,
    weight_value double precision NOT NULL CHECK (weight_value >= 0),
    weight_unit text NOT NULL CHECK (weight_unit IN ('KILOGRAM', 'GRAM', 'POUND')),
    length double precision NOT NULL CHECK (length > 0),
    width double precision NOT NULL CHECK (width > 0),
    height double precision NOT NULL CHECK (height > 0),
    dimension_unit text NOT NULL CHECK (
      dimension_unit IN ('CENTIMETER', 'MILLIMETER', 'INCH')
    ),
    revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT shipments_tenant_id_unique UNIQUE (tenant_id, id),
    CONSTRAINT shipments_delivery_requires_pickup_check CHECK (
      delivery_completed = false OR pickup_completed = true
    )
  );

CREATE INDEX IF NOT EXISTS shipments_tenant_status_idx ON operational_workspace.shipments (tenant_id, status);
