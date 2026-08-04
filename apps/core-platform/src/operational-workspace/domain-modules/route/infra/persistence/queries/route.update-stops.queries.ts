/** Types generated for queries found in "src/operational-workspace/domain-modules/route/infra/persistence/queries/route.update-stops.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpdateRouteStops' parameters type */
export interface IUpdateRouteStopsParams {
  rows: readonly ({
    id: string | null | void,
    shipmentId: string | null | void,
    operationType: string | null | void,
    status: string | null | void,
    executionSequence: string | null | void,
    arrivalTime: string | null | void,
    departureTime: string | null | void
  })[];
}

/** 'UpdateRouteStops' return type */
export type IUpdateRouteStopsResult = void;

/** 'UpdateRouteStops' query type */
export interface IUpdateRouteStopsQuery {
  params: IUpdateRouteStopsParams;
  result: IUpdateRouteStopsResult;
}

const updateRouteStopsIR: any = {"usedParamSet":{"rows":true},"params":[{"name":"rows","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"id","required":false},{"name":"shipmentId","required":false},{"name":"operationType","required":false},{"name":"status","required":false},{"name":"executionSequence","required":false},{"name":"arrivalTime","required":false},{"name":"departureTime","required":false}]},"locs":[{"a":124,"b":128}]}],"statement":"WITH updated_stops(id, shipment_id, operation_type, status, execution_sequence, arrival_time, departure_time) AS (\n  VALUES :rows\n)\nUPDATE operational_workspace.route_stops AS s\nSET shipment_id = u.shipment_id::uuid,\n    operation_type = u.operation_type::text,\n    status = u.status::text,\n    execution_sequence = u.execution_sequence::integer,\n    arrival_time = u.arrival_time::timestamptz,\n    departure_time = u.departure_time::timestamptz\nFROM updated_stops AS u\nWHERE s.id = u.id::uuid"};

/**
 * Query generated from SQL:
 * ```
 * WITH updated_stops(id, shipment_id, operation_type, status, execution_sequence, arrival_time, departure_time) AS (
 *   VALUES :rows
 * )
 * UPDATE operational_workspace.route_stops AS s
 * SET shipment_id = u.shipment_id::uuid,
 *     operation_type = u.operation_type::text,
 *     status = u.status::text,
 *     execution_sequence = u.execution_sequence::integer,
 *     arrival_time = u.arrival_time::timestamptz,
 *     departure_time = u.departure_time::timestamptz
 * FROM updated_stops AS u
 * WHERE s.id = u.id::uuid
 * ```
 */
export const updateRouteStops = new PreparedQuery<IUpdateRouteStopsParams,IUpdateRouteStopsResult>(updateRouteStopsIR);


