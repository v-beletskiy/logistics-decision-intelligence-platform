/* @name ReconcileAssignmentShipments */
WITH incoming AS (
  SELECT *
  FROM unnest(
    :ids!::uuid[],
    :shipmentIds!::uuid[],
    :weights!::double precision[],
    :weightUnits!::text[],
    :lengths!::double precision[],
    :widths!::double precision[],
    :heights!::double precision[],
    :dimensionUnits!::text[]
  ) AS values(id, shipment_id, weight, weight_unit, length, width, height, dimension_unit)
),
upserted AS (
  INSERT INTO operational_workspace.assignment_shipments AS current (
    tenant_id, assignment_id, id, shipment_id, weight, weight_unit,
    length, width, height, dimension_unit
  )
  SELECT
    :tenantId!, :assignmentId!, incoming.id, incoming.shipment_id,
    incoming.weight, incoming.weight_unit, incoming.length, incoming.width,
    incoming.height, incoming.dimension_unit
  FROM incoming
  ON CONFLICT (tenant_id, assignment_id, id) DO UPDATE SET
    shipment_id = EXCLUDED.shipment_id,
    weight = EXCLUDED.weight,
    weight_unit = EXCLUDED.weight_unit,
    length = EXCLUDED.length,
    width = EXCLUDED.width,
    height = EXCLUDED.height,
    dimension_unit = EXCLUDED.dimension_unit
  WHERE (
    current.shipment_id, current.weight, current.weight_unit, current.length,
    current.width, current.height, current.dimension_unit
  ) IS DISTINCT FROM (
    EXCLUDED.shipment_id, EXCLUDED.weight, EXCLUDED.weight_unit, EXCLUDED.length,
    EXCLUDED.width, EXCLUDED.height, EXCLUDED.dimension_unit
  )
  RETURNING id
),
deleted AS (
  DELETE FROM operational_workspace.assignment_shipments current
  WHERE current.tenant_id = :tenantId!
    AND current.assignment_id = :assignmentId!
    AND current.id <> ALL(:ids!::uuid[])
  RETURNING id
)
SELECT
  (SELECT count(*)::integer FROM upserted) AS "upsertedCount!",
  (SELECT count(*)::integer FROM deleted) AS "deletedCount!";
