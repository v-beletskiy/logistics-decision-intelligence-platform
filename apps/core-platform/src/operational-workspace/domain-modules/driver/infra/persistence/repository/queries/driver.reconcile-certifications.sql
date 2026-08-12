/* @name ReconcileDriverCertifications */
WITH incoming AS (
  SELECT *
  FROM unnest(
    :ids!::uuid[],
    :types!::text[],
    :credentialNumbers!::text[],
    :validFromDates!::timestamptz[],
    :validUntilDates!::timestamptz[]
  ) AS values(id, type, credential_number, valid_from, valid_until)
),
upserted AS (
  INSERT INTO operational_workspace.driver_certifications AS current (
    tenant_id,
    driver_id,
    id,
    type,
    credential_number,
    valid_from,
    valid_until
  )
  SELECT
    :tenantId!,
    :driverId!,
    incoming.id,
    incoming.type,
    incoming.credential_number,
    incoming.valid_from,
    incoming.valid_until
  FROM incoming
  ON CONFLICT (tenant_id, driver_id, id)
  DO UPDATE SET
    type = EXCLUDED.type,
    credential_number = EXCLUDED.credential_number,
    valid_from = EXCLUDED.valid_from,
    valid_until = EXCLUDED.valid_until,
    updated_at = now()
  WHERE (
    current.type,
    current.credential_number,
    current.valid_from,
    current.valid_until
  ) IS DISTINCT FROM (
    EXCLUDED.type,
    EXCLUDED.credential_number,
    EXCLUDED.valid_from,
    EXCLUDED.valid_until
  )
  RETURNING id
),
deleted AS (
  DELETE FROM operational_workspace.driver_certifications current
  WHERE current.tenant_id = :tenantId!
    AND current.driver_id = :driverId!
    AND current.id <> ALL(:ids!::uuid[])
  RETURNING id
)
SELECT
  (SELECT count(*)::integer FROM upserted) AS "upsertedCount!",
  (SELECT count(*)::integer FROM deleted) AS "deletedCount!";
