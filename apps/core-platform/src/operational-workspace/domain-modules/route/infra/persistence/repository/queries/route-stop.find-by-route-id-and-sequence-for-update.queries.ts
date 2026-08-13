/** Types generated for queries found in "src/operational-workspace/domain-modules/route/infra/persistence/repository/queries/route-stop.find-by-route-id-and-sequence-for-update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindRouteStopByRouteIdAndSequenceForUpdate' parameters type */
export interface IFindRouteStopByRouteIdAndSequenceForUpdateParams {
  routeId: string;
  sequence: number;
  tenantId: string;
}

/** 'FindRouteStopByRouteIdAndSequenceForUpdate' return type */
export interface IFindRouteStopByRouteIdAndSequenceForUpdateResult {
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

/** 'FindRouteStopByRouteIdAndSequenceForUpdate' query type */
export interface IFindRouteStopByRouteIdAndSequenceForUpdateQuery {
  params: IFindRouteStopByRouteIdAndSequenceForUpdateParams;
  result: IFindRouteStopByRouteIdAndSequenceForUpdateResult;
}

const findRouteStopByRouteIdAndSequenceForUpdateIR: any = {"usedParamSet":{"tenantId":true,"routeId":true,"sequence":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":264,"b":273}]},{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":294,"b":302}]},{"name":"sequence","required":true,"transform":{"type":"scalar"},"locs":[{"a":323,"b":332}]}],"statement":"SELECT\n  s.id,\n  s.route_id,\n  s.shipment_id,\n  s.sequence,\n  s.operation_type,\n  s.status,\n  s.planned_arrival_at,\n  s.planned_departure_at,\n  s.actual_arrival_at,\n  s.actual_departure_at,\n  s.revision\nFROM operational_workspace.route_stops s\nWHERE s.tenant_id = :tenantId!\n  AND s.route_id = :routeId!\n  AND s.sequence = :sequence!\nFOR UPDATE"};

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
 *   AND s.sequence = :sequence!
 * FOR UPDATE
 * ```
 */
export const findRouteStopByRouteIdAndSequenceForUpdate = new PreparedQuery<IFindRouteStopByRouteIdAndSequenceForUpdateParams,IFindRouteStopByRouteIdAndSequenceForUpdateResult>(findRouteStopByRouteIdAndSequenceForUpdateIR);


