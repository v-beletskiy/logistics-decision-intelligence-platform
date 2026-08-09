/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.exists-running-for-route.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ExistsRunningAssignmentForRoute' parameters type */
export interface IExistsRunningAssignmentForRouteParams {
  routeId: string;
}

/** 'ExistsRunningAssignmentForRoute' return type */
export interface IExistsRunningAssignmentForRouteResult {
  exists: boolean;
}

/** 'ExistsRunningAssignmentForRoute' query type */
export interface IExistsRunningAssignmentForRouteQuery {
  params: IExistsRunningAssignmentForRouteParams;
  result: IExistsRunningAssignmentForRouteResult;
}

const existsRunningAssignmentForRouteIR: any = {"usedParamSet":{"routeId":true},"params":[{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":87,"b":95}]}],"statement":"SELECT EXISTS (\n  SELECT 1\n  FROM operational_workspace.assignments\n  WHERE route_id = :routeId!\n    AND status = 'IN_PROGRESS'\n) AS \"exists!\""};

/**
 * Query generated from SQL:
 * ```
 * SELECT EXISTS (
 *   SELECT 1
 *   FROM operational_workspace.assignments
 *   WHERE route_id = :routeId!
 *     AND status = 'IN_PROGRESS'
 * ) AS "exists!"
 * ```
 */
export const existsRunningAssignmentForRoute = new PreparedQuery<IExistsRunningAssignmentForRouteParams,IExistsRunningAssignmentForRouteResult>(existsRunningAssignmentForRouteIR);
