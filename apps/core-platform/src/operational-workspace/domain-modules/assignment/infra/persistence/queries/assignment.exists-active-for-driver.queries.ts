/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.exists-active-for-driver.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ExistsActiveAssignmentForDriver' parameters type */
export interface IExistsActiveAssignmentForDriverParams {
  driverId: string;
}

/** 'ExistsActiveAssignmentForDriver' return type */
export interface IExistsActiveAssignmentForDriverResult {
  exists: boolean;
}

/** 'ExistsActiveAssignmentForDriver' query type */
export interface IExistsActiveAssignmentForDriverQuery {
  params: IExistsActiveAssignmentForDriverParams;
  result: IExistsActiveAssignmentForDriverResult;
}

const existsActiveAssignmentForDriverIR: any = {"usedParamSet":{"driverId":true},"params":[{"name":"driverId","required":true,"transform":{"type":"scalar"},"locs":[{"a":88,"b":97}]}],"statement":"SELECT EXISTS (\n  SELECT 1\n  FROM operational_workspace.assignments\n  WHERE driver_id = :driverId!\n    AND status IN ('CREATED', 'IN_PROGRESS')\n) AS \"exists!\""};

/**
 * Query generated from SQL:
 * ```
 * SELECT EXISTS (
 *   SELECT 1
 *   FROM operational_workspace.assignments
 *   WHERE driver_id = :driverId!
 *     AND status IN ('CREATED', 'IN_PROGRESS')
 * ) AS "exists!"
 * ```
 */
export const existsActiveAssignmentForDriver = new PreparedQuery<IExistsActiveAssignmentForDriverParams,IExistsActiveAssignmentForDriverResult>(existsActiveAssignmentForDriverIR);
