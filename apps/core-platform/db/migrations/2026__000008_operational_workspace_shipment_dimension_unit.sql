ALTER TABLE
  operational_workspace.shipments DROP CONSTRAINT IF EXISTS shipments_dimension_unit_check;

ALTER TABLE
  operational_workspace.shipments
ADD
  CONSTRAINT shipments_dimension_unit_check CHECK (
    dimension_unit IN ('CENTIMETER', 'MILLIMETER', 'INCH', 'METER')
  );