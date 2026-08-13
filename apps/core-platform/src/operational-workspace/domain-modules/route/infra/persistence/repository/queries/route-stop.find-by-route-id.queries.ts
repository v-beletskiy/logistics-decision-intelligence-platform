/** Types generated for queries found in "src/operational-workspace/domain-modules/route/infra/persistence/repository/queries/route-stop.find-by-route-id.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindRouteStopsByRouteId' parameters type */
export interface IFindRouteStopsByRouteIdParams {
  routeId: string;
  tenantId: string;
}

/** 'FindRouteStopsByRouteId' return type */
export interface IFindRouteStopsByRouteIdResult {
  actual_arrival_at: Date | null;
  actual_departure_at: Date | null;
  id: string;
  operation_type: string;
  planned_arrival_at: Date;
  planned_departure_at: Date;
  revision: string;
  route_id: string;
  sequence: number;
  shipment_id: string;
  status: string;
}

/** 'FindRouteStopsByRouteId' query type */
export interface IFindRouteStopsByRouteIdQuery {
  params: IFindRouteStopsByRouteIdParams;
  result: IFindRouteStopsByRouteIdResult;
}

const findRouteStopsByRouteIdIR: any = {"usedParamSet":{"tenantId":true,"routeId":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":264,"b":273}]},{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":294,"b":302}]}],"statement":"SELECT\n  s.id,\n  s.route_id,\n  s.shipment_id,\n  s.sequence,\n  s.operation_type,\n  s.status,\n  s.planned_arrival_at,\n  s.planned_departure_at,\n  s.actual_arrival_at,\n  s.actual_departure_at,\n  s.revision\nFROM operational_workspace.route_stops s\nWHERE s.tenant_id = :tenantId!\n  AND s.route_id = :routeId!\nORDER BY s.sequence"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   s.id,
 *   s.route_id,
 *   s.shipment_id,
 *   s.sequence,
 *   s.operation_type,
 *   s.status,
 *   s.planned_arrival_at,
 *   s.planned_departure_at,
 *   s.actual_arrival_at,
 *   s.actual_departure_at,
 *   s.revision
 * FROM operational_workspace.route_stops s
 * WHERE s.tenant_id = :tenantId!
 *   AND s.route_id = :routeId!
 * ORDER BY s.sequence
 * ```
 */
export const findRouteStopsByRouteId = new PreparedQuery<IFindRouteStopsByRouteIdParams,IFindRouteStopsByRouteIdResult>(findRouteStopsByRouteIdIR);


