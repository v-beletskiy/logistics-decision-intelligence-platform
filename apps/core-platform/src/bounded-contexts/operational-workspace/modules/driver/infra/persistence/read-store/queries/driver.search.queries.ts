/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/driver/infra/persistence/read-store/queries/driver.search.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

/** 'SearchDriversPage' parameters type */
export interface ISearchDriversPageParams {
  certificationType?: string | null | void;
  depotId?: string | null | void;
  firstNameDirection?: string | null | void;
  idDirection: string;
  lastNameDirection?: string | null | void;
  lastNamePrefix?: string | null | void;
  licenseNumberDirection?: string | null | void;
  limit: NumberOrString;
  offset: NumberOrString;
  sortBy: string;
  status?: string | null | void;
  statusDirection?: string | null | void;
  tenantId: string;
}

/** 'SearchDriversPage' return type */
export interface ISearchDriversPageResult {
  certifications: Json | null;
  depot_id: string | null;
  first_name: string | null;
  id: string | null;
  last_name: string | null;
  license_number: string | null;
  phone_number: string | null;
  status: string | null;
  totalItems: number;
}

/** 'SearchDriversPage' query type */
export interface ISearchDriversPageQuery {
  params: ISearchDriversPageParams;
  result: ISearchDriversPageResult;
}

const searchDriversPageIR: any = {"usedParamSet":{"tenantId":true,"status":true,"depotId":true,"lastNamePrefix":true,"certificationType":true,"sortBy":true,"lastNameDirection":true,"firstNameDirection":true,"licenseNumberDirection":true,"statusDirection":true,"idDirection":true,"offset":true,"limit":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":213,"b":222},{"a":3552,"b":3561}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":233,"b":239},{"a":269,"b":275}]},{"name":"depotId","required":false,"transform":{"type":"scalar"},"locs":[{"a":287,"b":294},{"a":326,"b":333}]},{"name":"lastNamePrefix","required":false,"transform":{"type":"scalar"},"locs":[{"a":352,"b":366},{"a":409,"b":423}]},{"name":"certificationType","required":false,"transform":{"type":"scalar"},"locs":[{"a":454,"b":471},{"a":705,"b":722}]},{"name":"sortBy","required":true,"transform":{"type":"scalar"},"locs":[{"a":833,"b":840},{"a":932,"b":939},{"a":1033,"b":1040},{"a":1134,"b":1141},{"a":1237,"b":1244},{"a":1355,"b":1362},{"a":1475,"b":1482},{"a":1571,"b":1578},{"a":1840,"b":1847},{"a":1935,"b":1942},{"a":2032,"b":2039},{"a":2129,"b":2136},{"a":2228,"b":2235},{"a":2342,"b":2349},{"a":2458,"b":2465},{"a":2550,"b":2557}]},{"name":"lastNameDirection","required":false,"transform":{"type":"scalar"},"locs":[{"a":855,"b":872},{"a":954,"b":971},{"a":1862,"b":1879},{"a":1957,"b":1974}]},{"name":"firstNameDirection","required":false,"transform":{"type":"scalar"},"locs":[{"a":1055,"b":1073},{"a":1156,"b":1174},{"a":2054,"b":2072},{"a":2151,"b":2169}]},{"name":"licenseNumberDirection","required":false,"transform":{"type":"scalar"},"locs":[{"a":1268,"b":1290},{"a":1386,"b":1408},{"a":2259,"b":2281},{"a":2373,"b":2395}]},{"name":"statusDirection","required":false,"transform":{"type":"scalar"},"locs":[{"a":1499,"b":1514},{"a":1595,"b":1610},{"a":2482,"b":2497},{"a":2574,"b":2589}]},{"name":"idDirection","required":true,"transform":{"type":"scalar"},"locs":[{"a":1669,"b":1681},{"a":1728,"b":1740},{"a":2644,"b":2656},{"a":2699,"b":2711}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":2750,"b":2757}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":2767,"b":2773}]}],"statement":"WITH filtered_drivers AS (\n  SELECT\n    d.id,\n    d.first_name,\n    d.last_name,\n    d.license_number,\n    d.depot_id,\n    d.phone_number,\n    d.status\n  FROM operational_workspace.drivers d\n  WHERE d.tenant_id = :tenantId!\n    AND (:status::text IS NULL OR d.status = :status)\n    AND (:depotId::uuid IS NULL OR d.depot_id = :depotId)\n    AND (\n      :lastNamePrefix::text IS NULL\n      OR d.last_name ILIKE :lastNamePrefix || '%'\n    )\n    AND (\n      :certificationType::text IS NULL\n      OR EXISTS (\n        SELECT 1\n        FROM operational_workspace.driver_certifications matching\n        WHERE matching.tenant_id = d.tenant_id\n          AND matching.driver_id = d.id\n          AND matching.type = :certificationType\n      )\n    )\n),\ndriver_page AS (\n  SELECT\n    d.*,\n    row_number() OVER (\n      ORDER BY\n        CASE WHEN :sortBy! = 'name' AND :lastNameDirection::text = 'asc' THEN d.last_name END ASC,\n        CASE WHEN :sortBy! = 'name' AND :lastNameDirection::text = 'desc' THEN d.last_name END DESC,\n        CASE WHEN :sortBy! = 'name' AND :firstNameDirection::text = 'asc' THEN d.first_name END ASC,\n        CASE WHEN :sortBy! = 'name' AND :firstNameDirection::text = 'desc' THEN d.first_name END DESC,\n        CASE WHEN :sortBy! = 'licenseNumber' AND :licenseNumberDirection::text = 'asc' THEN d.license_number END ASC,\n        CASE WHEN :sortBy! = 'licenseNumber' AND :licenseNumberDirection::text = 'desc' THEN d.license_number END DESC,\n        CASE WHEN :sortBy! = 'status' AND :statusDirection::text = 'asc' THEN d.status END ASC,\n        CASE WHEN :sortBy! = 'status' AND :statusDirection::text = 'desc' THEN d.status END DESC,\n        CASE WHEN :idDirection! = 'asc' THEN d.id END ASC,\n        CASE WHEN :idDirection! = 'desc' THEN d.id END DESC\n    ) AS row_order\n  FROM filtered_drivers d\n  ORDER BY\n    CASE WHEN :sortBy! = 'name' AND :lastNameDirection::text = 'asc' THEN d.last_name END ASC,\n    CASE WHEN :sortBy! = 'name' AND :lastNameDirection::text = 'desc' THEN d.last_name END DESC,\n    CASE WHEN :sortBy! = 'name' AND :firstNameDirection::text = 'asc' THEN d.first_name END ASC,\n    CASE WHEN :sortBy! = 'name' AND :firstNameDirection::text = 'desc' THEN d.first_name END DESC,\n    CASE WHEN :sortBy! = 'licenseNumber' AND :licenseNumberDirection::text = 'asc' THEN d.license_number END ASC,\n    CASE WHEN :sortBy! = 'licenseNumber' AND :licenseNumberDirection::text = 'desc' THEN d.license_number END DESC,\n    CASE WHEN :sortBy! = 'status' AND :statusDirection::text = 'asc' THEN d.status END ASC,\n    CASE WHEN :sortBy! = 'status' AND :statusDirection::text = 'desc' THEN d.status END DESC,\n    CASE WHEN :idDirection! = 'asc' THEN d.id END ASC,\n    CASE WHEN :idDirection! = 'desc' THEN d.id END DESC\n  OFFSET :offset!\n  LIMIT :limit!\n),\ndriver_total AS (\n  SELECT count(*)::integer AS total_items\n  FROM filtered_drivers\n),\nenriched_page AS (\n  SELECT\n    page.id,\n    page.first_name,\n    page.last_name,\n    page.license_number,\n    page.depot_id,\n    page.phone_number,\n    page.status,\n    page.row_order,\n    total.total_items,\n    COALESCE(certifications.items, '[]'::jsonb) AS certifications\n  FROM driver_page page\n  CROSS JOIN driver_total total\n  LEFT JOIN LATERAL (\n    SELECT jsonb_agg(\n      jsonb_build_object(\n        'id', c.id,\n        'type', c.type,\n        'credentialNumber', c.credential_number,\n        'validFrom', c.valid_from,\n        'validUntil', c.valid_until\n      )\n      ORDER BY c.id\n    ) AS items\n    FROM operational_workspace.driver_certifications c\n    WHERE c.tenant_id = :tenantId!\n      AND c.driver_id = page.id\n  ) certifications ON true\n)\nSELECT\n  id,\n  first_name,\n  last_name,\n  license_number,\n  depot_id,\n  phone_number,\n  status,\n  total_items AS \"totalItems!\",\n  certifications\nFROM (\n  SELECT\n    id,\n    first_name,\n    last_name,\n    license_number,\n    depot_id,\n    phone_number,\n    status,\n    total_items,\n    certifications,\n    row_order\n  FROM enriched_page\n  UNION ALL\n  SELECT\n    NULL::uuid AS id,\n    NULL::text AS first_name,\n    NULL::text AS last_name,\n    NULL::text AS license_number,\n    NULL::uuid AS depot_id,\n    NULL::text AS phone_number,\n    NULL::text AS status,\n    total.total_items,\n    '[]'::jsonb AS certifications,\n    NULL::bigint AS row_order\n  FROM driver_total total\n  WHERE NOT EXISTS (SELECT 1 FROM driver_page)\n) ordered_results\nORDER BY row_order"};

/**
 * Query generated from SQL:
 * ```
 * WITH filtered_drivers AS (
 *   SELECT
 *     d.id,
 *     d.first_name,
 *     d.last_name,
 *     d.license_number,
 *     d.depot_id,
 *     d.phone_number,
 *     d.status
 *   FROM operational_workspace.drivers d
 *   WHERE d.tenant_id = :tenantId!
 *     AND (:status::text IS NULL OR d.status = :status)
 *     AND (:depotId::uuid IS NULL OR d.depot_id = :depotId)
 *     AND (
 *       :lastNamePrefix::text IS NULL
 *       OR d.last_name ILIKE :lastNamePrefix || '%'
 *     )
 *     AND (
 *       :certificationType::text IS NULL
 *       OR EXISTS (
 *         SELECT 1
 *         FROM operational_workspace.driver_certifications matching
 *         WHERE matching.tenant_id = d.tenant_id
 *           AND matching.driver_id = d.id
 *           AND matching.type = :certificationType
 *       )
 *     )
 * ),
 * driver_page AS (
 *   SELECT
 *     d.*,
 *     row_number() OVER (
 *       ORDER BY
 *         CASE WHEN :sortBy! = 'name' AND :lastNameDirection::text = 'asc' THEN d.last_name END ASC,
 *         CASE WHEN :sortBy! = 'name' AND :lastNameDirection::text = 'desc' THEN d.last_name END DESC,
 *         CASE WHEN :sortBy! = 'name' AND :firstNameDirection::text = 'asc' THEN d.first_name END ASC,
 *         CASE WHEN :sortBy! = 'name' AND :firstNameDirection::text = 'desc' THEN d.first_name END DESC,
 *         CASE WHEN :sortBy! = 'licenseNumber' AND :licenseNumberDirection::text = 'asc' THEN d.license_number END ASC,
 *         CASE WHEN :sortBy! = 'licenseNumber' AND :licenseNumberDirection::text = 'desc' THEN d.license_number END DESC,
 *         CASE WHEN :sortBy! = 'status' AND :statusDirection::text = 'asc' THEN d.status END ASC,
 *         CASE WHEN :sortBy! = 'status' AND :statusDirection::text = 'desc' THEN d.status END DESC,
 *         CASE WHEN :idDirection! = 'asc' THEN d.id END ASC,
 *         CASE WHEN :idDirection! = 'desc' THEN d.id END DESC
 *     ) AS row_order
 *   FROM filtered_drivers d
 *   ORDER BY
 *     CASE WHEN :sortBy! = 'name' AND :lastNameDirection::text = 'asc' THEN d.last_name END ASC,
 *     CASE WHEN :sortBy! = 'name' AND :lastNameDirection::text = 'desc' THEN d.last_name END DESC,
 *     CASE WHEN :sortBy! = 'name' AND :firstNameDirection::text = 'asc' THEN d.first_name END ASC,
 *     CASE WHEN :sortBy! = 'name' AND :firstNameDirection::text = 'desc' THEN d.first_name END DESC,
 *     CASE WHEN :sortBy! = 'licenseNumber' AND :licenseNumberDirection::text = 'asc' THEN d.license_number END ASC,
 *     CASE WHEN :sortBy! = 'licenseNumber' AND :licenseNumberDirection::text = 'desc' THEN d.license_number END DESC,
 *     CASE WHEN :sortBy! = 'status' AND :statusDirection::text = 'asc' THEN d.status END ASC,
 *     CASE WHEN :sortBy! = 'status' AND :statusDirection::text = 'desc' THEN d.status END DESC,
 *     CASE WHEN :idDirection! = 'asc' THEN d.id END ASC,
 *     CASE WHEN :idDirection! = 'desc' THEN d.id END DESC
 *   OFFSET :offset!
 *   LIMIT :limit!
 * ),
 * driver_total AS (
 *   SELECT count(*)::integer AS total_items
 *   FROM filtered_drivers
 * ),
 * enriched_page AS (
 *   SELECT
 *     page.id,
 *     page.first_name,
 *     page.last_name,
 *     page.license_number,
 *     page.depot_id,
 *     page.phone_number,
 *     page.status,
 *     page.row_order,
 *     total.total_items,
 *     COALESCE(certifications.items, '[]'::jsonb) AS certifications
 *   FROM driver_page page
 *   CROSS JOIN driver_total total
 *   LEFT JOIN LATERAL (
 *     SELECT jsonb_agg(
 *       jsonb_build_object(
 *         'id', c.id,
 *         'type', c.type,
 *         'credentialNumber', c.credential_number,
 *         'validFrom', c.valid_from,
 *         'validUntil', c.valid_until
 *       )
 *       ORDER BY c.id
 *     ) AS items
 *     FROM operational_workspace.driver_certifications c
 *     WHERE c.tenant_id = :tenantId!
 *       AND c.driver_id = page.id
 *   ) certifications ON true
 * )
 * SELECT
 *   id,
 *   first_name,
 *   last_name,
 *   license_number,
 *   depot_id,
 *   phone_number,
 *   status,
 *   total_items AS "totalItems!",
 *   certifications
 * FROM (
 *   SELECT
 *     id,
 *     first_name,
 *     last_name,
 *     license_number,
 *     depot_id,
 *     phone_number,
 *     status,
 *     total_items,
 *     certifications,
 *     row_order
 *   FROM enriched_page
 *   UNION ALL
 *   SELECT
 *     NULL::uuid AS id,
 *     NULL::text AS first_name,
 *     NULL::text AS last_name,
 *     NULL::text AS license_number,
 *     NULL::uuid AS depot_id,
 *     NULL::text AS phone_number,
 *     NULL::text AS status,
 *     total.total_items,
 *     '[]'::jsonb AS certifications,
 *     NULL::bigint AS row_order
 *   FROM driver_total total
 *   WHERE NOT EXISTS (SELECT 1 FROM driver_page)
 * ) ordered_results
 * ORDER BY row_order
 * ```
 */
export const searchDriversPage = new PreparedQuery<ISearchDriversPageParams,ISearchDriversPageResult>(searchDriversPageIR);


/** 'SearchDriversCursor' parameters type */
export interface ISearchDriversCursorParams {
  afterFirstName?: string | null | void;
  afterId?: string | null | void;
  afterLastName?: string | null | void;
  afterLicenseNumber?: string | null | void;
  afterStatus?: string | null | void;
  certificationType?: string | null | void;
  depotId?: string | null | void;
  direction: string;
  lastNamePrefix?: string | null | void;
  limit: NumberOrString;
  sortBy: string;
  status?: string | null | void;
  tenantId: string;
}

/** 'SearchDriversCursor' return type */
export interface ISearchDriversCursorResult {
  certifications: Json | null;
  depot_id: string | null;
  first_name: string;
  id: string;
  last_name: string;
  license_number: string;
  phone_number: string | null;
  status: string;
}

/** 'SearchDriversCursor' query type */
export interface ISearchDriversCursorQuery {
  params: ISearchDriversCursorParams;
  result: ISearchDriversCursorResult;
}

const searchDriversCursorIR: any = {"usedParamSet":{"tenantId":true,"status":true,"depotId":true,"lastNamePrefix":true,"certificationType":true,"afterId":true,"sortBy":true,"direction":true,"afterLastName":true,"afterFirstName":true,"afterLicenseNumber":true,"afterStatus":true,"limit":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":213,"b":222},{"a":3446,"b":3455}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":233,"b":239},{"a":269,"b":275}]},{"name":"depotId","required":false,"transform":{"type":"scalar"},"locs":[{"a":287,"b":294},{"a":326,"b":333}]},{"name":"lastNamePrefix","required":false,"transform":{"type":"scalar"},"locs":[{"a":352,"b":366},{"a":409,"b":423}]},{"name":"certificationType","required":false,"transform":{"type":"scalar"},"locs":[{"a":454,"b":471},{"a":705,"b":722}]},{"name":"afterId","required":false,"transform":{"type":"scalar"},"locs":[{"a":805,"b":812},{"a":911,"b":918},{"a":965,"b":972},{"a":1182,"b":1189},{"a":1360,"b":1367},{"a":1575,"b":1582},{"a":1726,"b":1733},{"a":1907,"b":1914},{"a":2031,"b":2038}]},{"name":"sortBy","required":true,"transform":{"type":"scalar"},"locs":[{"a":843,"b":850},{"a":1004,"b":1011},{"a":1415,"b":1422},{"a":1781,"b":1788},{"a":2096,"b":2103},{"a":2178,"b":2185},{"a":2262,"b":2269},{"a":2345,"b":2352},{"a":2430,"b":2437},{"a":2526,"b":2533},{"a":2624,"b":2631},{"a":2705,"b":2712},{"a":3533,"b":3540},{"a":3616,"b":3623},{"a":3701,"b":3708},{"a":3785,"b":3792},{"a":3871,"b":3878},{"a":3968,"b":3975},{"a":4067,"b":4074},{"a":4149,"b":4156}]},{"name":"direction","required":true,"transform":{"type":"scalar"},"locs":[{"a":880,"b":890},{"a":933,"b":943},{"a":1054,"b":1064},{"a":1231,"b":1241},{"a":1474,"b":1484},{"a":1624,"b":1634},{"a":1833,"b":1843},{"a":1956,"b":1966},{"a":2118,"b":2128},{"a":2200,"b":2210},{"a":2284,"b":2294},{"a":2367,"b":2377},{"a":2461,"b":2471},{"a":2557,"b":2567},{"a":2648,"b":2658},{"a":2729,"b":2739},{"a":2788,"b":2798},{"a":2841,"b":2851},{"a":3555,"b":3565},{"a":3638,"b":3648},{"a":3723,"b":3733},{"a":3807,"b":3817},{"a":3902,"b":3912},{"a":3999,"b":4009},{"a":4091,"b":4101},{"a":4173,"b":4183},{"a":4233,"b":4243},{"a":4287,"b":4297}]},{"name":"afterLastName","required":false,"transform":{"type":"scalar"},"locs":[{"a":1137,"b":1150},{"a":1315,"b":1328}]},{"name":"afterFirstName","required":false,"transform":{"type":"scalar"},"locs":[{"a":1159,"b":1173},{"a":1337,"b":1351}]},{"name":"afterLicenseNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":1548,"b":1566},{"a":1699,"b":1717}]},{"name":"afterStatus","required":false,"transform":{"type":"scalar"},"locs":[{"a":1887,"b":1898},{"a":2011,"b":2022}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":2889,"b":2895}]}],"statement":"WITH filtered_drivers AS (\n  SELECT\n    d.id,\n    d.first_name,\n    d.last_name,\n    d.license_number,\n    d.depot_id,\n    d.phone_number,\n    d.status\n  FROM operational_workspace.drivers d\n  WHERE d.tenant_id = :tenantId!\n    AND (:status::text IS NULL OR d.status = :status)\n    AND (:depotId::uuid IS NULL OR d.depot_id = :depotId)\n    AND (\n      :lastNamePrefix::text IS NULL\n      OR d.last_name ILIKE :lastNamePrefix || '%'\n    )\n    AND (\n      :certificationType::text IS NULL\n      OR EXISTS (\n        SELECT 1\n        FROM operational_workspace.driver_certifications matching\n        WHERE matching.tenant_id = d.tenant_id\n          AND matching.driver_id = d.id\n          AND matching.type = :certificationType\n      )\n    )\n),\ndriver_page AS (\n  SELECT d.*\n  FROM filtered_drivers d\n  WHERE :afterId::uuid IS NULL\n    OR (\n      :sortBy! = 'id'\n      AND (\n        (:direction! = 'asc' AND d.id > :afterId)\n        OR (:direction! = 'desc' AND d.id < :afterId)\n      )\n    )\n    OR (\n      :sortBy! = 'name'\n      AND (\n        (\n          :direction! = 'asc'\n          AND (d.last_name, d.first_name, d.id)\n            > (:afterLastName::text, :afterFirstName::text, :afterId::uuid)\n        )\n        OR (\n          :direction! = 'desc'\n          AND (d.last_name, d.first_name, d.id)\n            < (:afterLastName::text, :afterFirstName::text, :afterId::uuid)\n        )\n      )\n    )\n    OR (\n      :sortBy! = 'licenseNumber'\n      AND (\n        (\n          :direction! = 'asc'\n          AND (d.license_number, d.id)\n            > (:afterLicenseNumber::text, :afterId::uuid)\n        )\n        OR (\n          :direction! = 'desc'\n          AND (d.license_number, d.id)\n            < (:afterLicenseNumber::text, :afterId::uuid)\n        )\n      )\n    )\n    OR (\n      :sortBy! = 'status'\n      AND (\n        (\n          :direction! = 'asc'\n          AND (d.status, d.id) > (:afterStatus::text, :afterId::uuid)\n        )\n        OR (\n          :direction! = 'desc'\n          AND (d.status, d.id) < (:afterStatus::text, :afterId::uuid)\n        )\n      )\n    )\n  ORDER BY\n    CASE WHEN :sortBy! = 'name' AND :direction! = 'asc' THEN d.last_name END ASC,\n    CASE WHEN :sortBy! = 'name' AND :direction! = 'desc' THEN d.last_name END DESC,\n    CASE WHEN :sortBy! = 'name' AND :direction! = 'asc' THEN d.first_name END ASC,\n    CASE WHEN :sortBy! = 'name' AND :direction! = 'desc' THEN d.first_name END DESC,\n    CASE WHEN :sortBy! = 'licenseNumber' AND :direction! = 'asc' THEN d.license_number END ASC,\n    CASE WHEN :sortBy! = 'licenseNumber' AND :direction! = 'desc' THEN d.license_number END DESC,\n    CASE WHEN :sortBy! = 'status' AND :direction! = 'asc' THEN d.status END ASC,\n    CASE WHEN :sortBy! = 'status' AND :direction! = 'desc' THEN d.status END DESC,\n    CASE WHEN :direction! = 'asc' THEN d.id END ASC,\n    CASE WHEN :direction! = 'desc' THEN d.id END DESC\n  LIMIT :limit!\n)\nSELECT\n  page.id,\n  page.first_name,\n  page.last_name,\n  page.license_number,\n  page.depot_id,\n  page.phone_number,\n  page.status,\n  COALESCE(certifications.items, '[]'::jsonb) AS certifications\nFROM driver_page page\nLEFT JOIN LATERAL (\n  SELECT jsonb_agg(\n    jsonb_build_object(\n      'id', c.id,\n      'type', c.type,\n      'credentialNumber', c.credential_number,\n      'validFrom', c.valid_from,\n      'validUntil', c.valid_until\n    )\n    ORDER BY c.id\n  ) AS items\n  FROM operational_workspace.driver_certifications c\n  WHERE c.tenant_id = :tenantId!\n    AND c.driver_id = page.id\n) certifications ON true\nORDER BY\n  CASE WHEN :sortBy! = 'name' AND :direction! = 'asc' THEN page.last_name END ASC,\n  CASE WHEN :sortBy! = 'name' AND :direction! = 'desc' THEN page.last_name END DESC,\n  CASE WHEN :sortBy! = 'name' AND :direction! = 'asc' THEN page.first_name END ASC,\n  CASE WHEN :sortBy! = 'name' AND :direction! = 'desc' THEN page.first_name END DESC,\n  CASE WHEN :sortBy! = 'licenseNumber' AND :direction! = 'asc' THEN page.license_number END ASC,\n  CASE WHEN :sortBy! = 'licenseNumber' AND :direction! = 'desc' THEN page.license_number END DESC,\n  CASE WHEN :sortBy! = 'status' AND :direction! = 'asc' THEN page.status END ASC,\n  CASE WHEN :sortBy! = 'status' AND :direction! = 'desc' THEN page.status END DESC,\n  CASE WHEN :direction! = 'asc' THEN page.id END ASC,\n  CASE WHEN :direction! = 'desc' THEN page.id END DESC"};

/**
 * Query generated from SQL:
 * ```
 * WITH filtered_drivers AS (
 *   SELECT
 *     d.id,
 *     d.first_name,
 *     d.last_name,
 *     d.license_number,
 *     d.depot_id,
 *     d.phone_number,
 *     d.status
 *   FROM operational_workspace.drivers d
 *   WHERE d.tenant_id = :tenantId!
 *     AND (:status::text IS NULL OR d.status = :status)
 *     AND (:depotId::uuid IS NULL OR d.depot_id = :depotId)
 *     AND (
 *       :lastNamePrefix::text IS NULL
 *       OR d.last_name ILIKE :lastNamePrefix || '%'
 *     )
 *     AND (
 *       :certificationType::text IS NULL
 *       OR EXISTS (
 *         SELECT 1
 *         FROM operational_workspace.driver_certifications matching
 *         WHERE matching.tenant_id = d.tenant_id
 *           AND matching.driver_id = d.id
 *           AND matching.type = :certificationType
 *       )
 *     )
 * ),
 * driver_page AS (
 *   SELECT d.*
 *   FROM filtered_drivers d
 *   WHERE :afterId::uuid IS NULL
 *     OR (
 *       :sortBy! = 'id'
 *       AND (
 *         (:direction! = 'asc' AND d.id > :afterId)
 *         OR (:direction! = 'desc' AND d.id < :afterId)
 *       )
 *     )
 *     OR (
 *       :sortBy! = 'name'
 *       AND (
 *         (
 *           :direction! = 'asc'
 *           AND (d.last_name, d.first_name, d.id)
 *             > (:afterLastName::text, :afterFirstName::text, :afterId::uuid)
 *         )
 *         OR (
 *           :direction! = 'desc'
 *           AND (d.last_name, d.first_name, d.id)
 *             < (:afterLastName::text, :afterFirstName::text, :afterId::uuid)
 *         )
 *       )
 *     )
 *     OR (
 *       :sortBy! = 'licenseNumber'
 *       AND (
 *         (
 *           :direction! = 'asc'
 *           AND (d.license_number, d.id)
 *             > (:afterLicenseNumber::text, :afterId::uuid)
 *         )
 *         OR (
 *           :direction! = 'desc'
 *           AND (d.license_number, d.id)
 *             < (:afterLicenseNumber::text, :afterId::uuid)
 *         )
 *       )
 *     )
 *     OR (
 *       :sortBy! = 'status'
 *       AND (
 *         (
 *           :direction! = 'asc'
 *           AND (d.status, d.id) > (:afterStatus::text, :afterId::uuid)
 *         )
 *         OR (
 *           :direction! = 'desc'
 *           AND (d.status, d.id) < (:afterStatus::text, :afterId::uuid)
 *         )
 *       )
 *     )
 *   ORDER BY
 *     CASE WHEN :sortBy! = 'name' AND :direction! = 'asc' THEN d.last_name END ASC,
 *     CASE WHEN :sortBy! = 'name' AND :direction! = 'desc' THEN d.last_name END DESC,
 *     CASE WHEN :sortBy! = 'name' AND :direction! = 'asc' THEN d.first_name END ASC,
 *     CASE WHEN :sortBy! = 'name' AND :direction! = 'desc' THEN d.first_name END DESC,
 *     CASE WHEN :sortBy! = 'licenseNumber' AND :direction! = 'asc' THEN d.license_number END ASC,
 *     CASE WHEN :sortBy! = 'licenseNumber' AND :direction! = 'desc' THEN d.license_number END DESC,
 *     CASE WHEN :sortBy! = 'status' AND :direction! = 'asc' THEN d.status END ASC,
 *     CASE WHEN :sortBy! = 'status' AND :direction! = 'desc' THEN d.status END DESC,
 *     CASE WHEN :direction! = 'asc' THEN d.id END ASC,
 *     CASE WHEN :direction! = 'desc' THEN d.id END DESC
 *   LIMIT :limit!
 * )
 * SELECT
 *   page.id,
 *   page.first_name,
 *   page.last_name,
 *   page.license_number,
 *   page.depot_id,
 *   page.phone_number,
 *   page.status,
 *   COALESCE(certifications.items, '[]'::jsonb) AS certifications
 * FROM driver_page page
 * LEFT JOIN LATERAL (
 *   SELECT jsonb_agg(
 *     jsonb_build_object(
 *       'id', c.id,
 *       'type', c.type,
 *       'credentialNumber', c.credential_number,
 *       'validFrom', c.valid_from,
 *       'validUntil', c.valid_until
 *     )
 *     ORDER BY c.id
 *   ) AS items
 *   FROM operational_workspace.driver_certifications c
 *   WHERE c.tenant_id = :tenantId!
 *     AND c.driver_id = page.id
 * ) certifications ON true
 * ORDER BY
 *   CASE WHEN :sortBy! = 'name' AND :direction! = 'asc' THEN page.last_name END ASC,
 *   CASE WHEN :sortBy! = 'name' AND :direction! = 'desc' THEN page.last_name END DESC,
 *   CASE WHEN :sortBy! = 'name' AND :direction! = 'asc' THEN page.first_name END ASC,
 *   CASE WHEN :sortBy! = 'name' AND :direction! = 'desc' THEN page.first_name END DESC,
 *   CASE WHEN :sortBy! = 'licenseNumber' AND :direction! = 'asc' THEN page.license_number END ASC,
 *   CASE WHEN :sortBy! = 'licenseNumber' AND :direction! = 'desc' THEN page.license_number END DESC,
 *   CASE WHEN :sortBy! = 'status' AND :direction! = 'asc' THEN page.status END ASC,
 *   CASE WHEN :sortBy! = 'status' AND :direction! = 'desc' THEN page.status END DESC,
 *   CASE WHEN :direction! = 'asc' THEN page.id END ASC,
 *   CASE WHEN :direction! = 'desc' THEN page.id END DESC
 * ```
 */
export const searchDriversCursor = new PreparedQuery<ISearchDriversCursorParams,ISearchDriversCursorResult>(searchDriversCursorIR);
