/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/driver/infra/persistence/repository/queries/driver.reconcile-certifications.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

export type DateOrStringArray = (DateOrString)[];

export type stringArray = (string)[];

/** 'ReconcileDriverCertifications' parameters type */
export interface IReconcileDriverCertificationsParams {
  credentialNumbers: stringArray;
  driverId: string;
  ids: stringArray;
  tenantId: string;
  types: stringArray;
  validFromDates: DateOrStringArray;
  validUntilDates: DateOrStringArray;
}

/** 'ReconcileDriverCertifications' return type */
export interface IReconcileDriverCertificationsResult {
  deletedCount: number;
  upsertedCount: number;
}

/** 'ReconcileDriverCertifications' query type */
export interface IReconcileDriverCertificationsQuery {
  params: IReconcileDriverCertificationsParams;
  result: IReconcileDriverCertificationsResult;
}

const reconcileDriverCertificationsIR: any = {"usedParamSet":{"ids":true,"types":true,"credentialNumbers":true,"validFromDates":true,"validUntilDates":true,"tenantId":true,"driverId":true},"params":[{"name":"ids","required":true,"transform":{"type":"scalar"},"locs":[{"a":49,"b":53},{"a":1302,"b":1306}]},{"name":"types","required":true,"transform":{"type":"scalar"},"locs":[{"a":68,"b":74}]},{"name":"credentialNumbers","required":true,"transform":{"type":"scalar"},"locs":[{"a":89,"b":107}]},{"name":"validFromDates","required":true,"transform":{"type":"scalar"},"locs":[{"a":122,"b":137}]},{"name":"validUntilDates","required":true,"transform":{"type":"scalar"},"locs":[{"a":159,"b":175}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":468,"b":477},{"a":1226,"b":1235}]},{"name":"driverId","required":true,"transform":{"type":"scalar"},"locs":[{"a":484,"b":493},{"a":1265,"b":1274}]}],"statement":"WITH incoming AS (\n  SELECT *\n  FROM unnest(\n    :ids!::uuid[],\n    :types!::text[],\n    :credentialNumbers!::text[],\n    :validFromDates!::timestamptz[],\n    :validUntilDates!::timestamptz[]\n  ) AS values(id, type, credential_number, valid_from, valid_until)\n),\nupserted AS (\n  INSERT INTO operational_workspace.driver_certifications AS current (\n    tenant_id,\n    driver_id,\n    id,\n    type,\n    credential_number,\n    valid_from,\n    valid_until\n  )\n  SELECT\n    :tenantId!,\n    :driverId!,\n    incoming.id,\n    incoming.type,\n    incoming.credential_number,\n    incoming.valid_from,\n    incoming.valid_until\n  FROM incoming\n  ON CONFLICT (tenant_id, driver_id, id)\n  DO UPDATE SET\n    type = EXCLUDED.type,\n    credential_number = EXCLUDED.credential_number,\n    valid_from = EXCLUDED.valid_from,\n    valid_until = EXCLUDED.valid_until,\n    updated_at = now()\n  WHERE (\n    current.type,\n    current.credential_number,\n    current.valid_from,\n    current.valid_until\n  ) IS DISTINCT FROM (\n    EXCLUDED.type,\n    EXCLUDED.credential_number,\n    EXCLUDED.valid_from,\n    EXCLUDED.valid_until\n  )\n  RETURNING id\n),\ndeleted AS (\n  DELETE FROM operational_workspace.driver_certifications current\n  WHERE current.tenant_id = :tenantId!\n    AND current.driver_id = :driverId!\n    AND current.id <> ALL(:ids!::uuid[])\n  RETURNING id\n)\nSELECT\n  (SELECT count(*)::integer FROM upserted) AS \"upsertedCount!\",\n  (SELECT count(*)::integer FROM deleted) AS \"deletedCount!\""};

/**
 * Query generated from SQL:
 * ```
 * WITH incoming AS (
 *   SELECT *
 *   FROM unnest(
 *     :ids!::uuid[],
 *     :types!::text[],
 *     :credentialNumbers!::text[],
 *     :validFromDates!::timestamptz[],
 *     :validUntilDates!::timestamptz[]
 *   ) AS values(id, type, credential_number, valid_from, valid_until)
 * ),
 * upserted AS (
 *   INSERT INTO operational_workspace.driver_certifications AS current (
 *     tenant_id,
 *     driver_id,
 *     id,
 *     type,
 *     credential_number,
 *     valid_from,
 *     valid_until
 *   )
 *   SELECT
 *     :tenantId!,
 *     :driverId!,
 *     incoming.id,
 *     incoming.type,
 *     incoming.credential_number,
 *     incoming.valid_from,
 *     incoming.valid_until
 *   FROM incoming
 *   ON CONFLICT (tenant_id, driver_id, id)
 *   DO UPDATE SET
 *     type = EXCLUDED.type,
 *     credential_number = EXCLUDED.credential_number,
 *     valid_from = EXCLUDED.valid_from,
 *     valid_until = EXCLUDED.valid_until,
 *     updated_at = now()
 *   WHERE (
 *     current.type,
 *     current.credential_number,
 *     current.valid_from,
 *     current.valid_until
 *   ) IS DISTINCT FROM (
 *     EXCLUDED.type,
 *     EXCLUDED.credential_number,
 *     EXCLUDED.valid_from,
 *     EXCLUDED.valid_until
 *   )
 *   RETURNING id
 * ),
 * deleted AS (
 *   DELETE FROM operational_workspace.driver_certifications current
 *   WHERE current.tenant_id = :tenantId!
 *     AND current.driver_id = :driverId!
 *     AND current.id <> ALL(:ids!::uuid[])
 *   RETURNING id
 * )
 * SELECT
 *   (SELECT count(*)::integer FROM upserted) AS "upsertedCount!",
 *   (SELECT count(*)::integer FROM deleted) AS "deletedCount!"
 * ```
 */
export const reconcileDriverCertifications = new PreparedQuery<IReconcileDriverCertificationsParams,IReconcileDriverCertificationsResult>(reconcileDriverCertificationsIR);
