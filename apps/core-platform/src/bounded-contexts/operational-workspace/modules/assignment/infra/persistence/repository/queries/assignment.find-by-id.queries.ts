/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/assignment/infra/persistence/repository/queries/assignment.find-by-id.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

export type Json =
  null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'FindAssignmentById' parameters type */
export interface IFindAssignmentByIdParams {
  id: string;
  tenantId: string;
}

/** 'FindAssignmentById' return type */
export interface IFindAssignmentByIdResult {
  assigned_at: Date;
  cancelled_at: Date | null;
  completed_at: Date | null;
  driver_id: string;
  id: string;
  revision: string;
  route_id: string;
  shipments: Json | null;
  started_at: Date | null;
  status: string;
  vehicle_id: string;
}

/** 'FindAssignmentById' query type */
export interface IFindAssignmentByIdQuery {
  params: IFindAssignmentByIdParams;
  result: IFindAssignmentByIdResult;
}

const findAssignmentByIdIR: any = {
  usedParamSet: { tenantId: true, id: true },
  params: [
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 738, b: 747 }],
    },
    {
      name: "id",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 762, b: 765 }],
    },
  ],
  statement:
    "SELECT\n  a.id,\n  a.route_id,\n  a.vehicle_id,\n  a.driver_id,\n  a.status,\n  a.revision,\n  a.assigned_at,\n  a.started_at,\n  a.completed_at,\n  a.cancelled_at,\n  COALESCE(\n    jsonb_agg(\n      jsonb_build_object(\n        'id', s.id,\n        'shipmentId', s.shipment_id,\n        'weight', s.weight,\n        'weightUnit', s.weight_unit,\n        'length', s.length,\n        'width', s.width,\n        'height', s.height,\n        'dimensionUnit', s.dimension_unit\n      )\n      ORDER BY s.shipment_id\n    ) FILTER (WHERE s.id IS NOT NULL),\n    '[]'::jsonb\n  ) AS shipments\nFROM operational_workspace.assignments a\nLEFT JOIN operational_workspace.assignment_shipments s\n  ON s.tenant_id = a.tenant_id\n AND s.assignment_id = a.id\nWHERE a.tenant_id = :tenantId!\n  AND a.id = :id!\nGROUP BY a.id, a.revision",
};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   a.id,
 *   a.route_id,
 *   a.vehicle_id,
 *   a.driver_id,
 *   a.status,
 *   a.revision,
 *   a.assigned_at,
 *   a.started_at,
 *   a.completed_at,
 *   a.cancelled_at,
 *   COALESCE(
 *     jsonb_agg(
 *       jsonb_build_object(
 *         'id', s.id,
 *         'shipmentId', s.shipment_id,
 *         'weight', s.weight,
 *         'weightUnit', s.weight_unit,
 *         'length', s.length,
 *         'width', s.width,
 *         'height', s.height,
 *         'dimensionUnit', s.dimension_unit
 *       )
 *       ORDER BY s.shipment_id
 *     ) FILTER (WHERE s.id IS NOT NULL),
 *     '[]'::jsonb
 *   ) AS shipments
 * FROM operational_workspace.assignments a
 * LEFT JOIN operational_workspace.assignment_shipments s
 *   ON s.tenant_id = a.tenant_id
 *  AND s.assignment_id = a.id
 * WHERE a.tenant_id = :tenantId!
 *   AND a.id = :id!
 * GROUP BY a.id, a.revision
 * ```
 */
export const findAssignmentById = new PreparedQuery<
  IFindAssignmentByIdParams,
  IFindAssignmentByIdResult
>(findAssignmentByIdIR);
