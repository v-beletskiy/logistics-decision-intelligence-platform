/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/repository/queries/assignment.update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

export type NumberOrString = number | string;

/** 'UpdateAssignment' parameters type */
export interface IUpdateAssignmentParams {
  assignedAt: DateOrString;
  cancelledAt?: DateOrString | null | void;
  completedAt?: DateOrString | null | void;
  driverId: string;
  expectedRevision: NumberOrString;
  id: string;
  routeId: string;
  startedAt?: DateOrString | null | void;
  status: string;
  tenantId: string;
  vehicleId: string;
}

/** 'UpdateAssignment' return type */
export interface IUpdateAssignmentResult {
  revision: string;
}

/** 'UpdateAssignment' query type */
export interface IUpdateAssignmentQuery {
  params: IUpdateAssignmentParams;
  result: IUpdateAssignmentResult;
}

const updateAssignmentIR: any = {"usedParamSet":{"routeId":true,"vehicleId":true,"driverId":true,"status":true,"assignedAt":true,"startedAt":true,"completedAt":true,"cancelledAt":true,"tenantId":true,"id":true,"expectedRevision":true},"params":[{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":56,"b":64}]},{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":84,"b":94}]},{"name":"driverId","required":true,"transform":{"type":"scalar"},"locs":[{"a":113,"b":122}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":138,"b":145}]},{"name":"assignedAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":166,"b":177}]},{"name":"startedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":197,"b":206}]},{"name":"completedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":228,"b":239}]},{"name":"cancelledAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":261,"b":272}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":345,"b":354}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":367,"b":370}]},{"name":"expectedRevision","required":true,"transform":{"type":"scalar"},"locs":[{"a":389,"b":406}]}],"statement":"UPDATE operational_workspace.assignments\nSET route_id = :routeId!,\n    vehicle_id = :vehicleId!,\n    driver_id = :driverId!,\n    status = :status!,\n    assigned_at = :assignedAt!,\n    started_at = :startedAt,\n    completed_at = :completedAt,\n    cancelled_at = :cancelledAt,\n    revision = revision + 1,\n    updated_at = now()\nWHERE tenant_id = :tenantId!\n  AND id = :id!\n  AND revision = :expectedRevision!\nRETURNING revision"};

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
 *     revision = revision + 1,
 *     updated_at = now()
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 *   AND revision = :expectedRevision!
 * RETURNING revision
 * ```
 */
export const updateAssignment = new PreparedQuery<IUpdateAssignmentParams,IUpdateAssignmentResult>(updateAssignmentIR);


