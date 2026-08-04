/** Types generated for queries found in "src/operational-workspace/domain-modules/route/infra/persistence/queries/route.insert-stops.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'InsertRouteStops' parameters type */
export interface IInsertRouteStopsParams {
  rows: readonly ({
    id: string | null | void,
    routeId: string | null | void,
    shipmentId: string | null | void,
    operationType: string | null | void,
    status: string | null | void,
    executionSequence: number | null | void,
    arrivalTime: DateOrString | null | void,
    departureTime: DateOrString | null | void
  })[];
}

/** 'InsertRouteStops' return type */
export type IInsertRouteStopsResult = void;

/** 'InsertRouteStops' query type */
export interface IInsertRouteStopsQuery {
  params: IInsertRouteStopsParams;
  result: IInsertRouteStopsResult;
}

const insertRouteStopsIR: any = {"usedParamSet":{"rows":true},"params":[{"name":"rows","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"id","required":false},{"name":"routeId","required":false},{"name":"shipmentId","required":false},{"name":"operationType","required":false},{"name":"status","required":false},{"name":"executionSequence","required":false},{"name":"arrivalTime","required":false},{"name":"departureTime","required":false}]},"locs":[{"a":157,"b":161}]}],"statement":"INSERT INTO operational_workspace.route_stops\n  (id, route_id, shipment_id, operation_type, status, execution_sequence, arrival_time, departure_time)\nVALUES :rows"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.route_stops
 *   (id, route_id, shipment_id, operation_type, status, execution_sequence, arrival_time, departure_time)
 * VALUES :rows
 * ```
 */
export const insertRouteStops = new PreparedQuery<IInsertRouteStopsParams,IInsertRouteStopsResult>(insertRouteStopsIR);


