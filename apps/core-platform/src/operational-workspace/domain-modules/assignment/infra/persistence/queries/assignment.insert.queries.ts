/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.insert.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

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
  vehicleId: string;
}

/** 'InsertAssignment' return type */
export type IInsertAssignmentResult = void;

/** 'InsertAssignment' query type */
export interface IInsertAssignmentQuery {
  params: IInsertAssignmentParams;
  result: IInsertAssignmentResult;
}

const insertAssignmentIR: any = {"usedParamSet":{"id":true,"routeId":true,"vehicleId":true,"driverId":true,"status":true,"assignedAt":true,"startedAt":true,"completedAt":true,"cancelledAt":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":160,"b":163}]},{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":166,"b":174}]},{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":177,"b":187}]},{"name":"driverId","required":true,"transform":{"type":"scalar"},"locs":[{"a":190,"b":199}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":202,"b":209}]},{"name":"assignedAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":215,"b":226}]},{"name":"startedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":229,"b":238}]},{"name":"completedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":241,"b":252}]},{"name":"cancelledAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":255,"b":266}]}],"statement":"INSERT INTO operational_workspace.assignments\n  (id, route_id, vehicle_id, driver_id, status,\n   assigned_at, started_at, completed_at, cancelled_at)\nVALUES\n  (:id!, :routeId!, :vehicleId!, :driverId!, :status!,\n   :assignedAt!, :startedAt, :completedAt, :cancelledAt)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.assignments
 *   (id, route_id, vehicle_id, driver_id, status,
 *    assigned_at, started_at, completed_at, cancelled_at)
 * VALUES
 *   (:id!, :routeId!, :vehicleId!, :driverId!, :status!,
 *    :assignedAt!, :startedAt, :completedAt, :cancelledAt)
 * ```
 */
export const insertAssignment = new PreparedQuery<IInsertAssignmentParams,IInsertAssignmentResult>(insertAssignmentIR);


