CREATE TABLE
  IF NOT EXISTS operational_workspace.assignment_shipments (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    assignment_id uuid NOT NULL,
    shipment_id uuid NOT NULL,
    weight double precision NOT NULL CHECK (weight >= 0),
    weight_unit text NOT NULL CHECK (weight_unit IN ('KILOGRAM', 'GRAM', 'POUND')),
    length double precision NOT NULL CHECK (length > 0),
    width double precision NOT NULL CHECK (width > 0),
    height double precision NOT NULL CHECK (height > 0),
    dimension_unit text NOT NULL CHECK (
      dimension_unit IN ('CENTIMETER', 'MILLIMETER', 'INCH')
    ),
    PRIMARY KEY (tenant_id, assignment_id, id),
    CONSTRAINT assignment_shipments_assignment_fk FOREIGN KEY (tenant_id, assignment_id) REFERENCES operational_workspace.assignments (tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT assignment_shipments_shipment_fk FOREIGN KEY (tenant_id, shipment_id) REFERENCES operational_workspace.shipments (tenant_id, id) ON DELETE RESTRICT,
    CONSTRAINT assignment_shipments_shipment_unique UNIQUE (tenant_id, assignment_id, shipment_id)
  );

CREATE INDEX IF NOT EXISTS assignment_shipments_tenant_shipment_idx ON operational_workspace.assignment_shipments (tenant_id, shipment_id);