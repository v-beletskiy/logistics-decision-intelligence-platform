CREATE TABLE
  IF NOT EXISTS operational_workspace.assignment_shipments (
    id uuid PRIMARY KEY,
    assignment_id uuid NOT NULL REFERENCES operational_workspace.assignments (id) ON DELETE CASCADE,
    shipment_id uuid NOT NULL REFERENCES operational_workspace.shipments (id) ON DELETE RESTRICT,
    weight double precision NOT NULL CHECK (weight >= 0),
    weight_unit text NOT NULL CHECK (weight_unit IN ('KILOGRAM', 'GRAM', 'POUND')),
    length double precision NOT NULL CHECK (length > 0),
    width double precision NOT NULL CHECK (width > 0),
    height double precision NOT NULL CHECK (height > 0),
    dimension_unit text NOT NULL CHECK (
      dimension_unit IN ('CENTIMETER', 'MILLIMETER', 'INCH')
    ),
    CONSTRAINT assignment_shipments_shipment_unique UNIQUE (assignment_id, shipment_id)
  );

CREATE INDEX IF NOT EXISTS assignment_shipments_assignment_id_idx ON operational_workspace.assignment_shipments (assignment_id);