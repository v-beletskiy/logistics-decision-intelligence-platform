/** Types generated for queries found in "src/operational-workspace/domain-modules/route/infra/persistence/repository/queries/route-stop.update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

export type NumberOrString = number | string;

/** 'UpdateRouteStop' parameters type */
export interface IUpdateRouteStopParams {
  actualArrivalAt?: DateOrString | null | void;
  actualDepartureAt?: DateOrString | null | void;
  expectedRevision: NumberOrString;
  id: string;
  status: string;
  tenantId: string;
}

/** 'UpdateRouteStop' return type */
export interface IUpdateRouteStopResult {
  revision: string;
}

/** 'UpdateRouteStop' query type */
export interface IUpdateRouteStopQuery {
  params: IUpdateRouteStopParams;
  result: IUpdateRouteStopResult;
}

const updateRouteStopIR: any = {"usedParamSet":{"status":true,"actualArrivalAt":true,"actualDepartureAt":true,"tenantId":true,"id":true,"expectedRevision":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":54,"b":61}]},{"name":"actualArrivalAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":88,"b":103}]},{"name":"actualDepartureAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":132,"b":149}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":222,"b":231}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":244,"b":247}]},{"name":"expectedRevision","required":true,"transform":{"type":"scalar"},"locs":[{"a":266,"b":283}]}],"statement":"UPDATE operational_workspace.route_stops\nSET status = :status!,\n    actual_arrival_at = :actualArrivalAt,\n    actual_departure_at = :actualDepartureAt,\n    revision = revision + 1,\n    updated_at = now()\nWHERE tenant_id = :tenantId!\n  AND id = :id!\n  AND revision = :expectedRevision!\nRETURNING revision"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE operational_workspace.route_stops
 * SET status = :status!,
 *     actual_arrival_at = :actualArrivalAt,
 *     actual_departure_at = :actualDepartureAt,
 *     revision = revision + 1,
 *     updated_at = now()
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 *   AND revision = :expectedRevision!
 * RETURNING revision
 * ```
 */
export const updateRouteStop = new PreparedQuery<IUpdateRouteStopParams,IUpdateRouteStopResult>(updateRouteStopIR);


