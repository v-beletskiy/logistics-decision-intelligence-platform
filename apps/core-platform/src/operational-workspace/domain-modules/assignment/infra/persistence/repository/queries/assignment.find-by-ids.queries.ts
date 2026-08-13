/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/repository/queries/assignment.find-by-ids.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'FindAssignmentsByIds' parameters type */
export interface IFindAssignmentsByIdsParams {
  ids: readonly (string | null | void)[];
  tenantId: string;
}

/** 'FindAssignmentsByIds' return type */
export interface IFindAssignmentsByIdsResult {
  assigned_at: Date;
  cancelled_at: Date | null;
  completed_at: Date | null;
  driver_id: string;
  id: string;
  route_id: string;
  shipments: Json | null;
  started_at: Date | null;
  status: string;
  vehicle_id: string;
}

/** 'FindAssignmentsByIds' query type */
export interface IFindAssignmentsByIdsQuery {
  params: IFindAssignmentsByIdsParams;
  result: IFindAssignmentsByIdsResult;
}

const findAssignmentsByIdsIR: any = {"usedParamSet":{"tenantId":true,"ids":true},"params":[{"name":"ids","required":false,"transform":{"type":"array_spread"},"locs":[{"a":749,"b":752}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":724,"b":733}]}],"statement":"SELECT\n  a.id,\n  a.route_id,\n  a.vehicle_id,\n  a.driver_id,\n  a.status,\n  a.assigned_at,\n  a.started_at,\n  a.completed_at,\n  a.cancelled_at,\n  COALESCE(\n    jsonb_agg(\n      jsonb_build_object(\n        'id', s.id,\n        'shipmentId', s.shipment_id,\n        'weight', s.weight,\n        'weightUnit', s.weight_unit,\n        'length', s.length,\n        'width', s.width,\n        'height', s.height,\n        'dimensionUnit', s.dimension_unit\n      )\n      ORDER BY s.shipment_id\n    ) FILTER (WHERE s.id IS NOT NULL),\n    '[]'::jsonb\n  ) AS shipments\nFROM operational_workspace.assignments a\nLEFT JOIN operational_workspace.assignment_shipments s\n  ON s.tenant_id = a.tenant_id\n AND s.assignment_id = a.id\nWHERE a.tenant_id = :tenantId!\n  AND a.id IN :ids\nGROUP BY a.id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   a.id,
 *   a.route_id,
 *   a.vehicle_id,
 *   a.driver_id,
 *   a.status,
 *   a.assigned_at,
 *   a.started_at,
 *   a.completed_at,
 *   a.cancelled_at,
 *   COALESCE(
 *     jsonb_agg(
 *       jsonb_build_object(
 *         'id', s.id,
 *         'shipmentId', s.shipment_id,
 *         'weight', s.weight,
 *         'weightUnit', s.weight_unit,
 *         'length', s.length,
 *         'width', s.width,
 *         'height', s.height,
 *         'dimensionUnit', s.dimension_unit
 *       )
 *       ORDER BY s.shipment_id
 *     ) FILTER (WHERE s.id IS NOT NULL),
 *     '[]'::jsonb
 *   ) AS shipments
 * FROM operational_workspace.assignments a
 * LEFT JOIN operational_workspace.assignment_shipments s
 *   ON s.tenant_id = a.tenant_id
 *  AND s.assignment_id = a.id
 * WHERE a.tenant_id = :tenantId!
 *   AND a.id IN :ids
 * GROUP BY a.id
 * ```
 */
export const findAssignmentsByIds = new PreparedQuery<IFindAssignmentsByIdsParams,IFindAssignmentsByIdsResult>(findAssignmentsByIdsIR);


