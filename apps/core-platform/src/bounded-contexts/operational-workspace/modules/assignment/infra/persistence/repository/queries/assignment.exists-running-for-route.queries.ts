/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/assignment/infra/persistence/repository/queries/assignment.exists-running-for-route.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ExistsRunningAssignmentForRoute' parameters type */
export interface IExistsRunningAssignmentForRouteParams {
  routeId: string;
  tenantId: string;
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

const existsRunningAssignmentForRouteIR: any = {"usedParamSet":{"tenantId":true,"routeId":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":88,"b":97}]},{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":118,"b":126}]}],"statement":"SELECT EXISTS (\n  SELECT 1\n  FROM operational_workspace.assignments\n  WHERE tenant_id = :tenantId!\n    AND route_id = :routeId!\n    AND status = 'IN_PROGRESS'\n) AS \"exists!\""};

/**
 * Query generated from SQL:
 * ```
 * SELECT EXISTS (
 *   SELECT 1
 *   FROM operational_workspace.assignments
 *   WHERE tenant_id = :tenantId!
 *     AND route_id = :routeId!
 *     AND status = 'IN_PROGRESS'
 * ) AS "exists!"
 * ```
 */
export const existsRunningAssignmentForRoute = new PreparedQuery<IExistsRunningAssignmentForRouteParams,IExistsRunningAssignmentForRouteResult>(existsRunningAssignmentForRouteIR);
