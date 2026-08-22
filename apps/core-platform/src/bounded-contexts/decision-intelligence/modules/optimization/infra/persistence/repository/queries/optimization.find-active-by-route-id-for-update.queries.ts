/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/optimization/infra/persistence/repository/queries/optimization.find-active-by-route-id-for-update.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

/** 'FindActiveOptimizationByRouteIdForUpdate' parameters type */
export interface IFindActiveOptimizationByRouteIdForUpdateParams {
  routeId: string;
  tenantId: string;
}

/** 'FindActiveOptimizationByRouteIdForUpdate' return type */
export interface IFindActiveOptimizationByRouteIdForUpdateResult {
  id: string;
  input_version: number | null;
  revision: string;
  route_id: string;
  status: string;
}

/** 'FindActiveOptimizationByRouteIdForUpdate' query type */
export interface IFindActiveOptimizationByRouteIdForUpdateQuery {
  params: IFindActiveOptimizationByRouteIdForUpdateParams;
  result: IFindActiveOptimizationByRouteIdForUpdateResult;
}

const findActiveOptimizationByRouteIdForUpdateIR: any = {
  usedParamSet: { tenantId: true, routeId: true },
  params: [
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 122, b: 131 }],
    },
    {
      name: "routeId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 150, b: 158 }],
    },
  ],
  statement:
    "SELECT\n  id,\n  route_id,\n  status,\n  input_version,\n  revision\nFROM decision_intelligence.optimizations\nWHERE tenant_id = :tenantId!\n  AND route_id = :routeId!\n  AND status IN ('QUEUED', 'RUNNING')\nFOR UPDATE",
};

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
 * FOR UPDATE
 * ```
 */
export const findActiveOptimizationByRouteIdForUpdate = new PreparedQuery<
  IFindActiveOptimizationByRouteIdForUpdateParams,
  IFindActiveOptimizationByRouteIdForUpdateResult
>(findActiveOptimizationByRouteIdForUpdateIR);
