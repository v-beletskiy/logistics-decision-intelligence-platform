/* @name FindDriverByIdForUpdate */
SELECT
  d.id,
  d.first_name,
  d.last_name,
  d.license_number,
  d.depot_id,
  d.phone_number,
  d.status,
  d.revision,
  COALESCE(certifications.items, '[]'::jsonb) AS certifications
FROM operational_workspace.drivers d
LEFT JOIN LATERAL (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'type', c.type,
      'credentialNumber', c.credential_number,
      'validFrom', c.valid_from,
      'validUntil', c.valid_until
    )
    ORDER BY c.id
  ) AS items
  FROM operational_workspace.driver_certifications c
  WHERE c.tenant_id = d.tenant_id
    AND c.driver_id = d.id
) certifications ON true
WHERE d.tenant_id = :tenantId!
  AND d.id = :id!
FOR UPDATE OF d;
