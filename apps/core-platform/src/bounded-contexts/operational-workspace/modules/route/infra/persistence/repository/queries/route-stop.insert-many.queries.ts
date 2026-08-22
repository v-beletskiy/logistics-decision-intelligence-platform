/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/route/infra/persistence/repository/queries/route-stop.insert-many.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

export type DateOrString = Date | string;

/** 'InsertRouteStops' parameters type */
export interface IInsertRouteStopsParams {
  rows: readonly {
    tenantId: string | null | void;
    id: string | null | void;
    routeId: string | null | void;
    shipmentId: string | null | void;
    sequence: number | null | void;
    operationType: string | null | void;
    status: string | null | void;
    plannedArrivalAt: DateOrString | null | void;
    plannedDepartureAt: DateOrString | null | void;
    actualArrivalAt: DateOrString | null | void;
    actualDepartureAt: DateOrString | null | void;
  }[];
}

/** 'InsertRouteStops' return type */
export type IInsertRouteStopsResult = void;

/** 'InsertRouteStops' query type */
export interface IInsertRouteStopsQuery {
  params: IInsertRouteStopsParams;
  result: IInsertRouteStopsResult;
}

const insertRouteStopsIR: any = {
  usedParamSet: { rows: true },
  params: [
    {
      name: "rows",
      required: false,
      transform: {
        type: "pick_array_spread",
        keys: [
          { name: "tenantId", required: false },
          { name: "id", required: false },
          { name: "routeId", required: false },
          { name: "shipmentId", required: false },
          { name: "sequence", required: false },
          { name: "operationType", required: false },
          { name: "status", required: false },
          { name: "plannedArrivalAt", required: false },
          { name: "plannedDepartureAt", required: false },
          { name: "actualArrivalAt", required: false },
          { name: "actualDepartureAt", required: false },
        ],
      },
      locs: [{ a: 232, b: 236 }],
    },
  ],
  statement:
    "INSERT INTO operational_workspace.route_stops (\n  tenant_id,\n  id,\n  route_id,\n  shipment_id,\n  sequence,\n  operation_type,\n  status,\n  planned_arrival_at,\n  planned_departure_at,\n  actual_arrival_at,\n  actual_departure_at\n)\nVALUES :rows",
};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.route_stops (
 *   tenant_id,
 *   id,
 *   route_id,
 *   shipment_id,
 *   sequence,
 *   operation_type,
 *   status,
 *   planned_arrival_at,
 *   planned_departure_at,
 *   actual_arrival_at,
 *   actual_departure_at
 * )
 * VALUES :rows
 * ```
 */
export const insertRouteStops = new PreparedQuery<
  IInsertRouteStopsParams,
  IInsertRouteStopsResult
>(insertRouteStopsIR);
