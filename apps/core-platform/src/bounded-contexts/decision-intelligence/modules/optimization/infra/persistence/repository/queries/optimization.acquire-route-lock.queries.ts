/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/optimization/infra/persistence/repository/queries/optimization.acquire-route-lock.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

/** 'AcquireOptimizationRouteLock' parameters type */
export interface IAcquireOptimizationRouteLockParams {
  routeId: string;
  tenantId: string;
}

/** 'AcquireOptimizationRouteLock' return type */
export interface IAcquireOptimizationRouteLockResult {
  pg_advisory_xact_lock: undefined | null;
}

/** 'AcquireOptimizationRouteLock' query type */
export interface IAcquireOptimizationRouteLockQuery {
  params: IAcquireOptimizationRouteLockParams;
  result: IAcquireOptimizationRouteLockResult;
}

const acquireOptimizationRouteLockIR: any = {
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
export const acquireOptimizationRouteLock = new PreparedQuery<
  IAcquireOptimizationRouteLockParams,
  IAcquireOptimizationRouteLockResult
>(acquireOptimizationRouteLockIR);
