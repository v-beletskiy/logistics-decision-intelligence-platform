/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.exists-active-for-vehicle.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ExistsActiveAssignmentForVehicle' parameters type */
export interface IExistsActiveAssignmentForVehicleParams {
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

const existsActiveAssignmentForVehicleIR: any = {"usedParamSet":{"vehicleId":true},"params":[{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":89,"b":99}]}],"statement":"SELECT EXISTS (\n  SELECT 1\n  FROM operational_workspace.assignments\n  WHERE vehicle_id = :vehicleId!\n    AND status IN ('CREATED', 'IN_PROGRESS')\n) AS \"exists!\""};

/**
 * Query generated from SQL:
 * ```
 * SELECT EXISTS (
 *   SELECT 1
 *   FROM operational_workspace.assignments
 *   WHERE vehicle_id = :vehicleId!
 *     AND status IN ('CREATED', 'IN_PROGRESS')
 * ) AS "exists!"
 * ```
 */
export const existsActiveAssignmentForVehicle = new PreparedQuery<IExistsActiveAssignmentForVehicleParams,IExistsActiveAssignmentForVehicleResult>(existsActiveAssignmentForVehicleIR);
