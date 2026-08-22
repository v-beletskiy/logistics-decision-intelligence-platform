/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/optimization/infra/persistence/repository/queries/optimization.acquire-route-replacement-lock.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

/** 'AcquireOptimizationRouteReplacementLock' parameters type */
export interface IAcquireOptimizationRouteReplacementLockParams {
  routeId: string;
  tenantId: string;
}

/** 'AcquireOptimizationRouteReplacementLock' return type */
export interface IAcquireOptimizationRouteReplacementLockResult {
  pg_advisory_xact_lock: undefined | null;
}

/** 'AcquireOptimizationRouteReplacementLock' query type */
export interface IAcquireOptimizationRouteReplacementLockQuery {
  params: IAcquireOptimizationRouteReplacementLockParams;
  result: IAcquireOptimizationRouteReplacementLockResult;
}

const acquireOptimizationRouteReplacementLockIR: any = {
  usedParamSet: { tenantId: true, routeId: true },
  params: [
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 49, b: 58 }],
    },
    {
      name: "routeId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 70, b: 78 }],
    },
  ],
  statement:
    "SELECT pg_advisory_xact_lock(\n  hashtextextended(:tenantId! || ':' || :routeId!, 0)\n)",
};

/**
 * Query generated from SQL:
 * ```
 * SELECT pg_advisory_xact_lock(
 *   hashtextextended(:tenantId! || ':' || :routeId!, 0)
 * )
 * ```
 */
export const acquireOptimizationRouteReplacementLock = new PreparedQuery<
  IAcquireOptimizationRouteReplacementLockParams,
  IAcquireOptimizationRouteReplacementLockResult
>(acquireOptimizationRouteReplacementLockIR);
