/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/assignment/infra/persistence/repository/queries/assignment.insert.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

export type DateOrString = Date | string;

/** 'InsertAssignment' parameters type */
export interface IInsertAssignmentParams {
  assignedAt: DateOrString;
  cancelledAt?: DateOrString | null | void;
  completedAt?: DateOrString | null | void;
  driverId: string;
  id: string;
  routeId: string;
  startedAt?: DateOrString | null | void;
  status: string;
  tenantId: string;
  vehicleId: string;
}

/** 'InsertAssignment' return type */
export type IInsertAssignmentResult = void;

/** 'InsertAssignment' query type */
export interface IInsertAssignmentQuery {
  params: IInsertAssignmentParams;
  result: IInsertAssignmentResult;
}

const insertAssignmentIR: any = {
  usedParamSet: {
    tenantId: true,
    id: true,
    routeId: true,
    vehicleId: true,
    driverId: true,
    status: true,
    assignedAt: true,
    startedAt: true,
    completedAt: true,
    cancelledAt: true,
  },
  params: [
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 171, b: 180 }],
    },
    {
      name: "id",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 183, b: 186 }],
    },
    {
      name: "routeId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 189, b: 197 }],
    },
    {
      name: "vehicleId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 200, b: 210 }],
    },
    {
      name: "driverId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 213, b: 222 }],
    },
    {
      name: "status",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 225, b: 232 }],
    },
    {
      name: "assignedAt",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 238, b: 249 }],
    },
    {
      name: "startedAt",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 252, b: 261 }],
    },
    {
      name: "completedAt",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 264, b: 275 }],
    },
    {
      name: "cancelledAt",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 278, b: 289 }],
    },
  ],
  statement:
    "INSERT INTO operational_workspace.assignments\n  (tenant_id, id, route_id, vehicle_id, driver_id, status,\n   assigned_at, started_at, completed_at, cancelled_at)\nVALUES\n  (:tenantId!, :id!, :routeId!, :vehicleId!, :driverId!, :status!,\n   :assignedAt!, :startedAt, :completedAt, :cancelledAt)",
};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.assignments
 *   (tenant_id, id, route_id, vehicle_id, driver_id, status,
 *    assigned_at, started_at, completed_at, cancelled_at)
 * VALUES
 *   (:tenantId!, :id!, :routeId!, :vehicleId!, :driverId!, :status!,
 *    :assignedAt!, :startedAt, :completedAt, :cancelledAt)
 * ```
 */
export const insertAssignment = new PreparedQuery<
  IInsertAssignmentParams,
  IInsertAssignmentResult
>(insertAssignmentIR);
