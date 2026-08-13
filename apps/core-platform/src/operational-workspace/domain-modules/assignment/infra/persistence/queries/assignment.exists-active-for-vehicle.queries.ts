/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.exists-active-for-vehicle.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ExistsActiveAssignmentForVehicle' parameters type */
export interface IExistsActiveAssignmentForVehicleParams {
  tenantId: string;
  vehicleId: string;
}

/** 'ExistsActiveAssignmentForVehicle' return type */
export interface IExistsActiveAssignmentForVehicleResult {
  exists: boolean;
}

/** 'ExistsActiveAssignmentForVehicle' query type */
export interface IExistsActiveAssignmentForVehicleQuery {
  params: IExistsActiveAssignmentForVehicleParams;
  result: IExistsActiveAssignmentForVehicleResult;
}

const existsActiveAssignmentForVehicleIR: any = {"usedParamSet":{"tenantId":true,"vehicleId":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":88,"b":97}]},{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":120,"b":130}]}],"statement":"SELECT EXISTS (\n  SELECT 1\n  FROM operational_workspace.assignments\n  WHERE tenant_id = :tenantId!\n    AND vehicle_id = :vehicleId!\n    AND status IN ('CREATED', 'IN_PROGRESS')\n) AS \"exists!\""};

/**
 * Query generated from SQL:
 * ```
 * SELECT EXISTS (
 *   SELECT 1
 *   FROM operational_workspace.assignments
 *   WHERE tenant_id = :tenantId!
 *     AND vehicle_id = :vehicleId!
 *     AND status IN ('CREATED', 'IN_PROGRESS')
 * ) AS "exists!"
 * ```
 */
export const existsActiveAssignmentForVehicle = new PreparedQuery<IExistsActiveAssignmentForVehicleParams,IExistsActiveAssignmentForVehicleResult>(existsActiveAssignmentForVehicleIR);
