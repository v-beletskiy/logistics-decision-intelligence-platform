/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.exists-active-for-route.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ExistsActiveAssignmentForRoute' parameters type */
export interface IExistsActiveAssignmentForRouteParams {
  routeId: string;
}

/** 'ExistsActiveAssignmentForRoute' return type */
export interface IExistsActiveAssignmentForRouteResult {
  exists: boolean;
}

/** 'ExistsActiveAssignmentForRoute' query type */
export interface IExistsActiveAssignmentForRouteQuery {
  params: IExistsActiveAssignmentForRouteParams;
  result: IExistsActiveAssignmentForRouteResult;
}

const existsActiveAssignmentForRouteIR: any = {"usedParamSet":{"routeId":true},"params":[{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":87,"b":95}]}],"statement":"SELECT EXISTS (\n  SELECT 1\n  FROM operational_workspace.assignments\n  WHERE route_id = :routeId!\n    AND status IN ('CREATED', 'IN_PROGRESS')\n) AS \"exists!\""};

/**
 * Query generated from SQL:
 * ```
 * SELECT EXISTS (
 *   SELECT 1
 *   FROM operational_workspace.assignments
 *   WHERE route_id = :routeId!
 *     AND status IN ('CREATED', 'IN_PROGRESS')
 * ) AS "exists!"
 * ```
 */
export const existsActiveAssignmentForRoute = new PreparedQuery<IExistsActiveAssignmentForRouteParams,IExistsActiveAssignmentForRouteResult>(existsActiveAssignmentForRouteIR);
