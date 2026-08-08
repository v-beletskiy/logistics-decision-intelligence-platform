/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'UpdateAssignment' parameters type */
export interface IUpdateAssignmentParams {
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

/** 'UpdateAssignment' return type */
export type IUpdateAssignmentResult = void;

/** 'UpdateAssignment' query type */
export interface IUpdateAssignmentQuery {
  params: IUpdateAssignmentParams;
  result: IUpdateAssignmentResult;
}

const updateAssignmentIR: any = {"usedParamSet":{"routeId":true,"vehicleId":true,"driverId":true,"status":true,"assignedAt":true,"startedAt":true,"completedAt":true,"cancelledAt":true,"id":true},"params":[{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":56,"b":64}]},{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":84,"b":94}]},{"name":"driverId","required":true,"transform":{"type":"scalar"},"locs":[{"a":113,"b":122}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":138,"b":145}]},{"name":"assignedAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":166,"b":177}]},{"name":"startedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":197,"b":206}]},{"name":"completedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":228,"b":239}]},{"name":"cancelledAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":261,"b":272}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":309,"b":312}]}],"statement":"UPDATE operational_workspace.assignments\nSET route_id = :routeId!,\n    vehicle_id = :vehicleId!,\n    driver_id = :driverId!,\n    status = :status!,\n    assigned_at = :assignedAt!,\n    started_at = :startedAt,\n    completed_at = :completedAt,\n    cancelled_at = :cancelledAt,\n    updated_at = now()\nWHERE id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE operational_workspace.assignments
 * SET route_id = :routeId!,
 *     vehicle_id = :vehicleId!,
 *     driver_id = :driverId!,
 *     status = :status!,
 *     assigned_at = :assignedAt!,
 *     started_at = :startedAt,
 *     completed_at = :completedAt,
 *     cancelled_at = :cancelledAt,
 *     updated_at = now()
 * WHERE id = :id!
 * ```
 */
export const updateAssignment = new PreparedQuery<IUpdateAssignmentParams,IUpdateAssignmentResult>(updateAssignmentIR);


