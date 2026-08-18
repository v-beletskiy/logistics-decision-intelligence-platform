/** Types generated for queries found in "src/decision-intelligence/domain-modules/optimization/infra/persistence/repository/queries/optimization.find-by-route-id-active.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindOptimizationByRouteIdActive' parameters type */
export interface IFindOptimizationByRouteIdActiveParams {
  routeId: string;
  tenantId: string;
}

/** 'FindOptimizationByRouteIdActive' return type */
export interface IFindOptimizationByRouteIdActiveResult {
  id: string;
  input_version: number | null;
  revision: string;
  route_id: string;
  status: string;
}

/** 'FindOptimizationByRouteIdActive' query type */
export interface IFindOptimizationByRouteIdActiveQuery {
  params: IFindOptimizationByRouteIdActiveParams;
  result: IFindOptimizationByRouteIdActiveResult;
}

const findOptimizationByRouteIdActiveIR: any = {"usedParamSet":{"tenantId":true,"routeId":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":122,"b":131}]},{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":150,"b":158}]}],"statement":"SELECT\n  id,\n  route_id,\n  status,\n  input_version,\n  revision\nFROM decision_intelligence.optimizations\nWHERE tenant_id = :tenantId!\n  AND route_id = :routeId!\n  AND status IN ('QUEUED', 'RUNNING')\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   route_id,
 *   status,
 *   input_version,
 *   revision
 * FROM decision_intelligence.optimizations
 * WHERE tenant_id = :tenantId!
 *   AND route_id = :routeId!
 *   AND status IN ('QUEUED', 'RUNNING')
 * LIMIT 1
 * ```
 */
export const findOptimizationByRouteIdActive = new PreparedQuery<IFindOptimizationByRouteIdActiveParams,IFindOptimizationByRouteIdActiveResult>(findOptimizationByRouteIdActiveIR);


