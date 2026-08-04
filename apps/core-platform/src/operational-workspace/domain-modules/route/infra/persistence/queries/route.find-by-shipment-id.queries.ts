/** Types generated for queries found in "src/operational-workspace/domain-modules/route/infra/persistence/queries/route.find-by-shipment-id.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'FindRoutesByShipmentId' parameters type */
export interface IFindRoutesByShipmentIdParams {
  shipmentId: string;
}

/** 'FindRoutesByShipmentId' return type */
export interface IFindRoutesByShipmentIdResult {
  id: string;
  status: string;
  stops: Json | null;
}

/** 'FindRoutesByShipmentId' query type */
export interface IFindRoutesByShipmentIdQuery {
  params: IFindRoutesByShipmentIdParams;
  result: IFindRoutesByShipmentIdResult;
}

const findRoutesByShipmentIdIR: any = {"usedParamSet":{"shipmentId":true},"params":[{"name":"shipmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":659,"b":670}]}],"statement":"SELECT\n  r.id,\n  r.status,\n  COALESCE(\n    jsonb_agg(\n      jsonb_build_object(\n        'id', s.id,\n        'shipmentId', s.shipment_id,\n        'operationType', s.operation_type,\n        'status', s.status,\n        'arrivalTime', s.arrival_time,\n        'departureTime', s.departure_time\n      )\n      ORDER BY s.execution_sequence\n    ) FILTER (WHERE s.id IS NOT NULL),\n    '[]'::jsonb\n  ) AS stops\nFROM operational_workspace.routes r\nLEFT JOIN operational_workspace.route_stops s ON s.route_id = r.id\nWHERE EXISTS (\n  SELECT 1\n  FROM operational_workspace.route_stops matching_stop\n  WHERE matching_stop.route_id = r.id\n    AND matching_stop.shipment_id = :shipmentId!\n)\nGROUP BY r.id\nORDER BY r.created_at"};

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
 * WHERE EXISTS (
 *   SELECT 1
 *   FROM operational_workspace.route_stops matching_stop
 *   WHERE matching_stop.route_id = r.id
 *     AND matching_stop.shipment_id = :shipmentId!
 * )
 * GROUP BY r.id
 * ORDER BY r.created_at
 * ```
 */
export const findRoutesByShipmentId = new PreparedQuery<IFindRoutesByShipmentIdParams,IFindRoutesByShipmentIdResult>(findRoutesByShipmentIdIR);


