/** Types generated for queries found in "src/operational-workspace/domain-modules/route/infra/persistence/queries/route.delete-stops.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteRouteStops' parameters type */
export interface IDeleteRouteStopsParams {
  ids: readonly (string | null | void)[];
}

/** 'DeleteRouteStops' return type */
export type IDeleteRouteStopsResult = void;

/** 'DeleteRouteStops' query type */
export interface IDeleteRouteStopsQuery {
  params: IDeleteRouteStopsParams;
  result: IDeleteRouteStopsResult;
}

const deleteRouteStopsIR: any = {"usedParamSet":{"ids":true},"params":[{"name":"ids","required":false,"transform":{"type":"array_spread"},"locs":[{"a":58,"b":61}]}],"statement":"DELETE FROM operational_workspace.route_stops\nWHERE id IN :ids"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.route_stops
 * WHERE id IN :ids
 * ```
 */
export const deleteRouteStops = new PreparedQuery<IDeleteRouteStopsParams,IDeleteRouteStopsResult>(deleteRouteStopsIR);


