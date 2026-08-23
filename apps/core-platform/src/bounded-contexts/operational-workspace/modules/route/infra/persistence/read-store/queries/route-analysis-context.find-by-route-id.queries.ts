/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/route/infra/persistence/read-store/queries/route-analysis-context.find-by-route-id.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

/** 'FindRouteAnalysisContextByRouteId' parameters type */
export interface IFindRouteAnalysisContextByRouteIdParams {
  routeId: string;
  tenantId: string;
}

/** 'FindRouteAnalysisContextByRouteId' return type */
export interface IFindRouteAnalysisContextByRouteIdResult {
  latitude: number | null;
  longitude: number | null;
  planned_arrival_at: Date;
  planned_departure_at: Date;
  route_id: string;
  route_revision: string;
  shipment_id: string;
}

/** 'FindRouteAnalysisContextByRouteId' query type */
export interface IFindRouteAnalysisContextByRouteIdQuery {
  params: IFindRouteAnalysisContextByRouteIdParams;
  result: IFindRouteAnalysisContextByRouteIdResult;
}

const findRouteAnalysisContextByRouteIdIR: any = {
  usedParamSet: { tenantId: true, routeId: true },
  params: [
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 694, b: 703 }],
    },
    {
      name: "routeId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 718, b: 726 }],
    },
  ],
  statement:
    "SELECT\n  r.id AS route_id,\n  r.revision AS route_revision,\n  s.shipment_id,\n  s.planned_arrival_at,\n  s.planned_departure_at,\n  CASE s.operation_type\n    WHEN 'PICKUP' THEN shipment.pickup_latitude\n    WHEN 'DELIVERY' THEN shipment.delivery_latitude\n  END AS latitude,\n  CASE s.operation_type\n    WHEN 'PICKUP' THEN shipment.pickup_longitude\n    WHEN 'DELIVERY' THEN shipment.delivery_longitude\n  END AS longitude\nFROM operational_workspace.routes r\nLEFT JOIN operational_workspace.route_stops s\n  ON s.tenant_id = r.tenant_id\n  AND s.route_id = r.id\nLEFT JOIN operational_workspace.shipments shipment\n  ON shipment.tenant_id = s.tenant_id\n  AND shipment.id = s.shipment_id\nWHERE r.tenant_id = :tenantId!\n  AND r.id = :routeId!\nORDER BY s.sequence",
};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   r.id AS route_id,
 *   r.revision AS route_revision,
 *   s.shipment_id,
 *   s.planned_arrival_at,
 *   s.planned_departure_at,
 *   CASE s.operation_type
 *     WHEN 'PICKUP' THEN shipment.pickup_latitude
 *     WHEN 'DELIVERY' THEN shipment.delivery_latitude
 *   END AS latitude,
 *   CASE s.operation_type
 *     WHEN 'PICKUP' THEN shipment.pickup_longitude
 *     WHEN 'DELIVERY' THEN shipment.delivery_longitude
 *   END AS longitude
 * FROM operational_workspace.routes r
 * LEFT JOIN operational_workspace.route_stops s
 *   ON s.tenant_id = r.tenant_id
 *   AND s.route_id = r.id
 * LEFT JOIN operational_workspace.shipments shipment
 *   ON shipment.tenant_id = s.tenant_id
 *   AND shipment.id = s.shipment_id
 * WHERE r.tenant_id = :tenantId!
 *   AND r.id = :routeId!
 * ORDER BY s.sequence
 * ```
 */
export const findRouteAnalysisContextByRouteId = new PreparedQuery<
  IFindRouteAnalysisContextByRouteIdParams,
  IFindRouteAnalysisContextByRouteIdResult
>(findRouteAnalysisContextByRouteIdIR);
