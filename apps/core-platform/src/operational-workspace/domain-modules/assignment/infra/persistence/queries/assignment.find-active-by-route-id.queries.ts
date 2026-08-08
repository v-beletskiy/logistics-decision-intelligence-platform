/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.find-active-by-route-id.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'FindActiveAssignmentByRouteId' parameters type */
export interface IFindActiveAssignmentByRouteIdParams {
  routeId: string;
}

/** 'FindActiveAssignmentByRouteId' return type */
export interface IFindActiveAssignmentByRouteIdResult {
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

/** 'FindActiveAssignmentByRouteId' query type */
export interface IFindActiveAssignmentByRouteIdQuery {
  params: IFindActiveAssignmentByRouteIdParams;
  result: IFindActiveAssignmentByRouteIdResult;
}

const findActiveAssignmentByRouteIdIR: any = {"usedParamSet":{"routeId":true},"params":[{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":690,"b":698}]}],"statement":"SELECT\n  a.id,\n  a.route_id,\n  a.vehicle_id,\n  a.driver_id,\n  a.status,\n  a.assigned_at,\n  a.started_at,\n  a.completed_at,\n  a.cancelled_at,\n  COALESCE(\n    jsonb_agg(\n      jsonb_build_object(\n        'id', s.id,\n        'shipmentId', s.shipment_id,\n        'weight', s.weight,\n        'weightUnit', s.weight_unit,\n        'length', s.length,\n        'width', s.width,\n        'height', s.height,\n        'dimensionUnit', s.dimension_unit\n      )\n      ORDER BY s.shipment_id\n    ) FILTER (WHERE s.id IS NOT NULL),\n    '[]'::jsonb\n  ) AS shipments\nFROM operational_workspace.assignments a\nLEFT JOIN operational_workspace.assignment_shipments s ON s.assignment_id = a.id\nWHERE a.route_id = :routeId!\n  AND a.status IN ('CREATED', 'IN_PROGRESS')\nGROUP BY a.id\nORDER BY a.assigned_at DESC\nLIMIT 1"};

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
 * LEFT JOIN operational_workspace.assignment_shipments s ON s.assignment_id = a.id
 * WHERE a.route_id = :routeId!
 *   AND a.status IN ('CREATED', 'IN_PROGRESS')
 * GROUP BY a.id
 * ORDER BY a.assigned_at DESC
 * LIMIT 1
 * ```
 */
export const findActiveAssignmentByRouteId = new PreparedQuery<IFindActiveAssignmentByRouteIdParams,IFindActiveAssignmentByRouteIdResult>(findActiveAssignmentByRouteIdIR);


