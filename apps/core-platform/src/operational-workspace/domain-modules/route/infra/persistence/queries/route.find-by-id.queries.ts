/** Types generated for queries found in "src/operational-workspace/domain-modules/route/infra/persistence/queries/route.find-by-id.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'FindRouteById' parameters type */
export interface IFindRouteByIdParams {
  id: string;
}

/** 'FindRouteById' return type */
export interface IFindRouteByIdResult {
  id: string;
  status: string;
  stops: Json | null;
}

/** 'FindRouteById' query type */
export interface IFindRouteByIdQuery {
  params: IFindRouteByIdParams;
  result: IFindRouteByIdResult;
}

const findRouteByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":517,"b":520}]}],"statement":"SELECT\n  r.id,\n  r.status,\n  COALESCE(\n    jsonb_agg(\n      jsonb_build_object(\n        'id', s.id,\n        'shipmentId', s.shipment_id,\n        'operationType', s.operation_type,\n        'status', s.status,\n        'arrivalTime', s.arrival_time,\n        'departureTime', s.departure_time\n      )\n      ORDER BY s.execution_sequence\n    ) FILTER (WHERE s.id IS NOT NULL),\n    '[]'::jsonb\n  ) AS stops\nFROM operational_workspace.routes r\nLEFT JOIN operational_workspace.route_stops s ON s.route_id = r.id\nWHERE r.id = :id!\nGROUP BY r.id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   r.id,
 *   r.status,
 *   COALESCE(
 *     jsonb_agg(
 *       jsonb_build_object(
 *         'id', s.id,
 *         'shipmentId', s.shipment_id,
 *         'operationType', s.operation_type,
 *         'status', s.status,
 *         'arrivalTime', s.arrival_time,
 *         'departureTime', s.departure_time
 *       )
 *       ORDER BY s.execution_sequence
 *     ) FILTER (WHERE s.id IS NOT NULL),
 *     '[]'::jsonb
 *   ) AS stops
 * FROM operational_workspace.routes r
 * LEFT JOIN operational_workspace.route_stops s ON s.route_id = r.id
 * WHERE r.id = :id!
 * GROUP BY r.id
 * ```
 */
export const findRouteById = new PreparedQuery<IFindRouteByIdParams,IFindRouteByIdResult>(findRouteByIdIR);


