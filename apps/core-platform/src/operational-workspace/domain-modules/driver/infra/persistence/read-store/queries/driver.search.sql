/* @name SearchDriversPage */
WITH filtered_drivers AS (
  SELECT
    d.id,
    d.first_name,
    d.last_name,
    d.license_number,
    d.depot_id,
    d.phone_number,
    d.status
  FROM operational_workspace.drivers d
  WHERE d.tenant_id = :tenantId!
    AND (:status::text IS NULL OR d.status = :status)
    AND (:depotId::uuid IS NULL OR d.depot_id = :depotId)
    AND (
      :lastNamePrefix::text IS NULL
      OR d.last_name ILIKE :lastNamePrefix || '%'
    )
    AND (
      :certificationType::text IS NULL
      OR EXISTS (
        SELECT 1
        FROM operational_workspace.driver_certifications matching
        WHERE matching.tenant_id = d.tenant_id
          AND matching.driver_id = d.id
          AND matching.type = :certificationType
      )
    )
),
driver_page AS (
  SELECT
    d.*,
    row_number() OVER (
      ORDER BY
        CASE WHEN :sortBy! = 'name' AND :lastNameDirection::text = 'asc' THEN d.last_name END ASC,
        CASE WHEN :sortBy! = 'name' AND :lastNameDirection::text = 'desc' THEN d.last_name END DESC,
        CASE WHEN :sortBy! = 'name' AND :firstNameDirection::text = 'asc' THEN d.first_name END ASC,
        CASE WHEN :sortBy! = 'name' AND :firstNameDirection::text = 'desc' THEN d.first_name END DESC,
        CASE WHEN :sortBy! = 'licenseNumber' AND :licenseNumberDirection::text = 'asc' THEN d.license_number END ASC,
        CASE WHEN :sortBy! = 'licenseNumber' AND :licenseNumberDirection::text = 'desc' THEN d.license_number END DESC,
        CASE WHEN :sortBy! = 'status' AND :statusDirection::text = 'asc' THEN d.status END ASC,
        CASE WHEN :sortBy! = 'status' AND :statusDirection::text = 'desc' THEN d.status END DESC,
        CASE WHEN :idDirection! = 'asc' THEN d.id END ASC,
        CASE WHEN :idDirection! = 'desc' THEN d.id END DESC
    ) AS row_order
  FROM filtered_drivers d
  ORDER BY
    CASE WHEN :sortBy! = 'name' AND :lastNameDirection::text = 'asc' THEN d.last_name END ASC,
    CASE WHEN :sortBy! = 'name' AND :lastNameDirection::text = 'desc' THEN d.last_name END DESC,
    CASE WHEN :sortBy! = 'name' AND :firstNameDirection::text = 'asc' THEN d.first_name END ASC,
    CASE WHEN :sortBy! = 'name' AND :firstNameDirection::text = 'desc' THEN d.first_name END DESC,
    CASE WHEN :sortBy! = 'licenseNumber' AND :licenseNumberDirection::text = 'asc' THEN d.license_number END ASC,
    CASE WHEN :sortBy! = 'licenseNumber' AND :licenseNumberDirection::text = 'desc' THEN d.license_number END DESC,
    CASE WHEN :sortBy! = 'status' AND :statusDirection::text = 'asc' THEN d.status END ASC,
    CASE WHEN :sortBy! = 'status' AND :statusDirection::text = 'desc' THEN d.status END DESC,
    CASE WHEN :idDirection! = 'asc' THEN d.id END ASC,
    CASE WHEN :idDirection! = 'desc' THEN d.id END DESC
  OFFSET :offset!
  LIMIT :limit!
),
driver_total AS (
  SELECT count(*)::integer AS total_items
  FROM filtered_drivers
),
enriched_page AS (
  SELECT
    page.id,
    page.first_name,
    page.last_name,
    page.license_number,
    page.depot_id,
    page.phone_number,
    page.status,
    page.row_order,
    total.total_items,
    COALESCE(certifications.items, '[]'::jsonb) AS certifications
  FROM driver_page page
  CROSS JOIN driver_total total
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
    WHERE c.tenant_id = :tenantId!
      AND c.driver_id = page.id
  ) certifications ON true
)
SELECT
  id,
  first_name,
  last_name,
  license_number,
  depot_id,
  phone_number,
  status,
  total_items AS "totalItems!",
  certifications
FROM (
  SELECT
    id,
    first_name,
    last_name,
    license_number,
    depot_id,
    phone_number,
    status,
    total_items,
    certifications,
    row_order
  FROM enriched_page
  UNION ALL
  SELECT
    NULL::uuid AS id,
    NULL::text AS first_name,
    NULL::text AS last_name,
    NULL::text AS license_number,
    NULL::uuid AS depot_id,
    NULL::text AS phone_number,
    NULL::text AS status,
    total.total_items,
    '[]'::jsonb AS certifications,
    NULL::bigint AS row_order
  FROM driver_total total
  WHERE NOT EXISTS (SELECT 1 FROM driver_page)
) ordered_results
ORDER BY row_order;

/* @name SearchDriversCursor */
WITH filtered_drivers AS (
  SELECT
    d.id,
    d.first_name,
    d.last_name,
    d.license_number,
    d.depot_id,
    d.phone_number,
    d.status
  FROM operational_workspace.drivers d
  WHERE d.tenant_id = :tenantId!
    AND (:status::text IS NULL OR d.status = :status)
    AND (:depotId::uuid IS NULL OR d.depot_id = :depotId)
    AND (
      :lastNamePrefix::text IS NULL
      OR d.last_name ILIKE :lastNamePrefix || '%'
    )
    AND (
      :certificationType::text IS NULL
      OR EXISTS (
        SELECT 1
        FROM operational_workspace.driver_certifications matching
        WHERE matching.tenant_id = d.tenant_id
          AND matching.driver_id = d.id
          AND matching.type = :certificationType
      )
    )
),
driver_page AS (
  SELECT d.*
  FROM filtered_drivers d
  WHERE :afterId::uuid IS NULL
    OR (
      :sortBy! = 'id'
      AND (
        (:direction! = 'asc' AND d.id > :afterId)
        OR (:direction! = 'desc' AND d.id < :afterId)
      )
    )
    OR (
      :sortBy! = 'name'
      AND (
        (
          :direction! = 'asc'
          AND (d.last_name, d.first_name, d.id)
            > (:afterLastName::text, :afterFirstName::text, :afterId::uuid)
        )
        OR (
          :direction! = 'desc'
          AND (d.last_name, d.first_name, d.id)
            < (:afterLastName::text, :afterFirstName::text, :afterId::uuid)
        )
      )
    )
    OR (
      :sortBy! = 'licenseNumber'
      AND (
        (
          :direction! = 'asc'
          AND (d.license_number, d.id)
            > (:afterLicenseNumber::text, :afterId::uuid)
        )
        OR (
          :direction! = 'desc'
          AND (d.license_number, d.id)
            < (:afterLicenseNumber::text, :afterId::uuid)
        )
      )
    )
    OR (
      :sortBy! = 'status'
      AND (
        (
          :direction! = 'asc'
          AND (d.status, d.id) > (:afterStatus::text, :afterId::uuid)
        )
        OR (
          :direction! = 'desc'
          AND (d.status, d.id) < (:afterStatus::text, :afterId::uuid)
        )
      )
    )
  ORDER BY
    CASE WHEN :sortBy! = 'name' AND :direction! = 'asc' THEN d.last_name END ASC,
    CASE WHEN :sortBy! = 'name' AND :direction! = 'desc' THEN d.last_name END DESC,
    CASE WHEN :sortBy! = 'name' AND :direction! = 'asc' THEN d.first_name END ASC,
    CASE WHEN :sortBy! = 'name' AND :direction! = 'desc' THEN d.first_name END DESC,
    CASE WHEN :sortBy! = 'licenseNumber' AND :direction! = 'asc' THEN d.license_number END ASC,
    CASE WHEN :sortBy! = 'licenseNumber' AND :direction! = 'desc' THEN d.license_number END DESC,
    CASE WHEN :sortBy! = 'status' AND :direction! = 'asc' THEN d.status END ASC,
    CASE WHEN :sortBy! = 'status' AND :direction! = 'desc' THEN d.status END DESC,
    CASE WHEN :direction! = 'asc' THEN d.id END ASC,
    CASE WHEN :direction! = 'desc' THEN d.id END DESC
  LIMIT :limit!
)
SELECT
  page.id,
  page.first_name,
  page.last_name,
  page.license_number,
  page.depot_id,
  page.phone_number,
  page.status,
  COALESCE(certifications.items, '[]'::jsonb) AS certifications
FROM driver_page page
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
  WHERE c.tenant_id = :tenantId!
    AND c.driver_id = page.id
) certifications ON true
ORDER BY
  CASE WHEN :sortBy! = 'name' AND :direction! = 'asc' THEN page.last_name END ASC,
  CASE WHEN :sortBy! = 'name' AND :direction! = 'desc' THEN page.last_name END DESC,
  CASE WHEN :sortBy! = 'name' AND :direction! = 'asc' THEN page.first_name END ASC,
  CASE WHEN :sortBy! = 'name' AND :direction! = 'desc' THEN page.first_name END DESC,
  CASE WHEN :sortBy! = 'licenseNumber' AND :direction! = 'asc' THEN page.license_number END ASC,
  CASE WHEN :sortBy! = 'licenseNumber' AND :direction! = 'desc' THEN page.license_number END DESC,
  CASE WHEN :sortBy! = 'status' AND :direction! = 'asc' THEN page.status END ASC,
  CASE WHEN :sortBy! = 'status' AND :direction! = 'desc' THEN page.status END DESC,
  CASE WHEN :direction! = 'asc' THEN page.id END ASC,
  CASE WHEN :direction! = 'desc' THEN page.id END DESC;
