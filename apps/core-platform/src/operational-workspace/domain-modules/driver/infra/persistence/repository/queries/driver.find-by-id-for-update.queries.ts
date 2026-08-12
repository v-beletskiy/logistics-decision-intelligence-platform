/** Types generated for queries found in "src/operational-workspace/domain-modules/driver/infra/persistence/repository/queries/driver.find-by-id-for-update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'FindDriverByIdForUpdate' parameters type */
export interface IFindDriverByIdForUpdateParams {
  id: string;
  tenantId: string;
}

/** 'FindDriverByIdForUpdate' return type */
export interface IFindDriverByIdForUpdateResult {
  certifications: Json | null;
  depot_id: string | null;
  first_name: string;
  id: string;
  last_name: string;
  license_number: string;
  phone_number: string | null;
  revision: number;
  status: string;
}

/** 'FindDriverByIdForUpdate' query type */
export interface IFindDriverByIdForUpdateQuery {
  params: IFindDriverByIdForUpdateParams;
  result: IFindDriverByIdForUpdateResult;
}

const findDriverByIdForUpdateIR: any = {"usedParamSet":{"tenantId":true,"id":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":639,"b":648}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":663,"b":666}]}],"statement":"SELECT\n  d.id,\n  d.first_name,\n  d.last_name,\n  d.license_number,\n  d.depot_id,\n  d.phone_number,\n  d.status,\n  d.revision,\n  COALESCE(certifications.items, '[]'::jsonb) AS certifications\nFROM operational_workspace.drivers d\nLEFT JOIN LATERAL (\n  SELECT jsonb_agg(\n    jsonb_build_object(\n      'id', c.id,\n      'type', c.type,\n      'credentialNumber', c.credential_number,\n      'validFrom', c.valid_from,\n      'validUntil', c.valid_until\n    )\n    ORDER BY c.id\n  ) AS items\n  FROM operational_workspace.driver_certifications c\n  WHERE c.tenant_id = d.tenant_id\n    AND c.driver_id = d.id\n) certifications ON true\nWHERE d.tenant_id = :tenantId!\n  AND d.id = :id!\nFOR UPDATE OF d"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   d.id,
 *   d.first_name,
 *   d.last_name,
 *   d.license_number,
 *   d.depot_id,
 *   d.phone_number,
 *   d.status,
 *   d.revision,
 *   COALESCE(certifications.items, '[]'::jsonb) AS certifications
 * FROM operational_workspace.drivers d
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
 *   WHERE c.tenant_id = d.tenant_id
 *     AND c.driver_id = d.id
 * ) certifications ON true
 * WHERE d.tenant_id = :tenantId!
 *   AND d.id = :id!
 * FOR UPDATE OF d
 * ```
 */
export const findDriverByIdForUpdate = new PreparedQuery<IFindDriverByIdForUpdateParams,IFindDriverByIdForUpdateResult>(findDriverByIdForUpdateIR);


