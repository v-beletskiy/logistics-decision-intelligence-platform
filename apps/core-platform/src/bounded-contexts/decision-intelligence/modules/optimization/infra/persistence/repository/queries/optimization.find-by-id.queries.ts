/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/optimization/infra/persistence/repository/queries/optimization.find-by-id.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindOptimizationById' parameters type */
export interface IFindOptimizationByIdParams {
  id: string;
  tenantId: string;
}

/** 'FindOptimizationById' return type */
export interface IFindOptimizationByIdResult {
  id: string;
  input_version: number | null;
  revision: string;
  route_id: string;
  status: string;
}

/** 'FindOptimizationById' query type */
export interface IFindOptimizationByIdQuery {
  params: IFindOptimizationByIdParams;
  result: IFindOptimizationByIdResult;
}

const findOptimizationByIdIR: any = {"usedParamSet":{"tenantId":true,"id":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":122,"b":131}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":144,"b":147}]}],"statement":"SELECT\n  id,\n  route_id,\n  status,\n  input_version,\n  revision\nFROM decision_intelligence.optimizations\nWHERE tenant_id = :tenantId!\n  AND id = :id!"};

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
 *   AND id = :id!
 * ```
 */
export const findOptimizationById = new PreparedQuery<IFindOptimizationByIdParams,IFindOptimizationByIdResult>(findOptimizationByIdIR);
