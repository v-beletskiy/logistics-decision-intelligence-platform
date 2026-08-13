CREATE TABLE
  IF NOT EXISTS operational_workspace.routes (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL,
    status text NOT NULL CHECK (
      status IN (
        'DRAFT',
        'PLANNED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED'
      )
    ),
    planned_stop_count integer NOT NULL CHECK (planned_stop_count > 0),
    next_stop_sequence integer NOT NULL DEFAULT 1 CHECK (next_stop_sequence > 0),
    active_stop_sequence integer,
    revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT routes_tenant_id_unique UNIQUE (tenant_id, id),
    CONSTRAINT routes_progression_check CHECK (
      next_stop_sequence <= planned_stop_count + 1
      AND (
        active_stop_sequence IS NULL
        OR active_stop_sequence = next_stop_sequence
      )
    )
  );

CREATE TABLE
  IF NOT EXISTS operational_workspace.route_stops (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL,
    route_id uuid NOT NULL,
    shipment_id uuid NOT NULL,
    operation_type text NOT NULL CHECK (operation_type IN ('PICKUP', 'DELIVERY')),
    status text NOT NULL CHECK (
      status IN (
        'PLANNED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED'
      )
    ),
    sequence integer NOT NULL CHECK (sequence > 0),
    planned_arrival_at timestamptz NOT NULL,
    planned_departure_at timestamptz NOT NULL,
    actual_arrival_at timestamptz,
    actual_departure_at timestamptz,
    revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT route_stops_route_fk FOREIGN KEY (tenant_id, route_id) REFERENCES operational_workspace.routes (tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT route_stops_shipment_fk FOREIGN KEY (tenant_id, shipment_id) REFERENCES operational_workspace.shipments (tenant_id, id) ON DELETE RESTRICT,
    CONSTRAINT route_stops_schedule_check CHECK (planned_departure_at >= planned_arrival_at),
    CONSTRAINT route_stops_actual_timeline_check CHECK (
      actual_departure_at IS NULL
      OR (
        actual_arrival_at IS NOT NULL
        AND actual_departure_at >= actual_arrival_at
      )
    ),
    CONSTRAINT route_stops_tenant_sequence_unique UNIQUE (tenant_id, route_id, sequence),
    CONSTRAINT route_stops_tenant_shipment_operation_unique UNIQUE (tenant_id, route_id, shipment_id, operation_type)
  );

CREATE INDEX IF NOT EXISTS route_stops_tenant_shipment_route_idx ON operational_workspace.route_stops (tenant_id, shipment_id, route_id);

--------------------------------------------------------------------------
CREATE TABLE
  IF NOT EXISTS operational_workspace.vehicles (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL,
    registration_number text NOT NULL,
    name text,
    depot_id uuid,
    status text NOT NULL CHECK (
      status IN (
        'AVAILABLE',
        'UNAVAILABLE',
        'MAINTENANCE',
        'DECOMMISSIONED'
      )
    ),
    revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT vehicles_tenant_id_unique UNIQUE (tenant_id, id),
    CONSTRAINT vehicles_tenant_registration_number_unique UNIQUE (tenant_id, registration_number),
    CONSTRAINT vehicles_depot_fk FOREIGN KEY (tenant_id, depot_id) REFERENCES operational_workspace.depots (tenant_id, id) ON DELETE RESTRICT
  );

CREATE TABLE
  IF NOT EXISTS operational_workspace.vehicle_compartments (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    type text NOT NULL CHECK (
      type IN (
        'DRY_CARGO',
        'REFRIGERATED',
        'FROZEN',
        'HAZARDOUS'
      )
    ),
    name text,
    max_weight double precision NOT NULL CHECK (max_weight >= 0),
    max_weight_unit text NOT NULL CHECK (max_weight_unit IN ('KILOGRAM', 'GRAM', 'POUND')),
    max_length double precision NOT NULL CHECK (max_length >= 0),
    max_width double precision NOT NULL CHECK (max_width >= 0),
    max_height double precision NOT NULL CHECK (max_height >= 0),
    dimension_unit text NOT NULL CHECK (
      dimension_unit IN ('CENTIMETER', 'MILLIMETER', 'INCH')
    ),
    max_volume double precision NOT NULL CHECK (max_volume >= 0),
    max_volume_unit text NOT NULL CHECK (
      max_volume_unit IN ('CUBIC_METER', 'CUBIC_FOOT', 'LITER')
    ),
    PRIMARY KEY (tenant_id, vehicle_id, id),
    CONSTRAINT vehicle_compartments_vehicle_fk FOREIGN KEY (tenant_id, vehicle_id) REFERENCES operational_workspace.vehicles (tenant_id, id) ON DELETE CASCADE
  );

CREATE INDEX IF NOT EXISTS vehicles_tenant_available_idx ON operational_workspace.vehicles (tenant_id, registration_number)
WHERE
  status = 'AVAILABLE';

CREATE INDEX IF NOT EXISTS vehicles_tenant_depot_idx ON operational_workspace.vehicles (tenant_id, depot_id)
WHERE
  depot_id IS NOT NULL;

--------------------------------------------------------------------------
CREATE TABLE
  IF NOT EXISTS operational_workspace.drivers (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    license_number text NOT NULL,
    depot_id uuid,
    phone_number text,
    status text NOT NULL CHECK (
      status IN ('AVAILABLE', 'UNAVAILABLE', 'SUSPENDED')
    ),
    revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT drivers_tenant_id_unique UNIQUE (tenant_id, id),
    CONSTRAINT drivers_tenant_license_number_unique UNIQUE (tenant_id, license_number),
    CONSTRAINT drivers_depot_fk FOREIGN KEY (tenant_id, depot_id) REFERENCES operational_workspace.depots (tenant_id, id) ON DELETE RESTRICT
  );

CREATE INDEX IF NOT EXISTS drivers_tenant_name_idx ON operational_workspace.drivers (tenant_id, last_name, first_name, id);

CREATE INDEX IF NOT EXISTS drivers_tenant_status_name_idx ON operational_workspace.drivers (tenant_id, status, last_name, first_name, id);

CREATE INDEX IF NOT EXISTS drivers_tenant_status_id_idx ON operational_workspace.drivers (tenant_id, status, id);

CREATE INDEX IF NOT EXISTS drivers_tenant_depot_name_idx ON operational_workspace.drivers (tenant_id, depot_id, last_name, first_name, id);

CREATE TABLE
  IF NOT EXISTS operational_workspace.driver_certifications (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    driver_id uuid NOT NULL,
    type text NOT NULL CHECK (btrim (type) <> ''),
    credential_number text NOT NULL CHECK (btrim (credential_number) <> ''),
    valid_from timestamptz NOT NULL,
    valid_until timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now (),
    PRIMARY KEY (tenant_id, driver_id, id),
    CONSTRAINT driver_certifications_driver_fk FOREIGN KEY (tenant_id, driver_id) REFERENCES operational_workspace.drivers (tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT driver_certifications_credential_unique UNIQUE (tenant_id, driver_id, type, credential_number),
    CONSTRAINT driver_certifications_validity_check CHECK (valid_from < valid_until)
  );

CREATE INDEX IF NOT EXISTS driver_certifications_tenant_type_driver_idx ON operational_workspace.driver_certifications (tenant_id, type, driver_id);
