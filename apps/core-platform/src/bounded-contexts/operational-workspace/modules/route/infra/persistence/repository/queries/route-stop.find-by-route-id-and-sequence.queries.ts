/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/route/infra/persistence/repository/queries/route-stop.find-by-route-id-and-sequence.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

/** 'FindRouteStopByRouteIdAndSequence' parameters type */
export interface IFindRouteStopByRouteIdAndSequenceParams {
  routeId: string;
  sequence: number;
  tenantId: string;
}

/** 'FindRouteStopByRouteIdAndSequence' return type */
export interface IFindRouteStopByRouteIdAndSequenceResult {
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

/** 'FindRouteStopByRouteIdAndSequence' query type */
export interface IFindRouteStopByRouteIdAndSequenceQuery {
  params: IFindRouteStopByRouteIdAndSequenceParams;
  result: IFindRouteStopByRouteIdAndSequenceResult;
}

const findRouteStopByRouteIdAndSequenceIR: any = {
  usedParamSet: { tenantId: true, routeId: true, sequence: true },
  params: [
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 264, b: 273 }],
    },
    {
      name: "routeId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 294, b: 302 }],
    },
    {
      name: "sequence",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 323, b: 332 }],
    },
  ],
  statement:
    "SELECT\n  s.id,\n  s.route_id,\n  s.shipment_id,\n  s.sequence,\n  s.operation_type,\n  s.status,\n  s.planned_arrival_at,\n  s.planned_departure_at,\n  s.actual_arrival_at,\n  s.actual_departure_at,\n  s.revision\nFROM operational_workspace.route_stops s\nWHERE s.tenant_id = :tenantId!\n  AND s.route_id = :routeId!\n  AND s.sequence = :sequence!",
};

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
 * ```
 */
export const findRouteStopByRouteIdAndSequence = new PreparedQuery<
  IFindRouteStopByRouteIdAndSequenceParams,
  IFindRouteStopByRouteIdAndSequenceResult
>(findRouteStopByRouteIdAndSequenceIR);
