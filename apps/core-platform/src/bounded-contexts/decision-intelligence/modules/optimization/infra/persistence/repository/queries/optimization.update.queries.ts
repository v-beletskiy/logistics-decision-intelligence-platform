/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/optimization/infra/persistence/repository/queries/optimization.update.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

export type NumberOrString = number | string;

/** 'UpdateOptimization' parameters type */
export interface IUpdateOptimizationParams {
  expectedRevision: NumberOrString;
  id: string;
  inputVersion?: number | null | void;
  routeId: string;
  status: string;
  tenantId: string;
}

/** 'UpdateOptimization' return type */
export interface IUpdateOptimizationResult {
  revision: string;
}

/** 'UpdateOptimization' query type */
export interface IUpdateOptimizationQuery {
  params: IUpdateOptimizationParams;
  result: IUpdateOptimizationResult;
}

const updateOptimizationIR: any = {
  usedParamSet: {
    routeId: true,
    status: true,
    inputVersion: true,
    tenantId: true,
    id: true,
    expectedRevision: true,
  },
  params: [
    {
      name: "routeId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 58, b: 66 }],
    },
    {
      name: "status",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 82, b: 89 }],
    },
    {
      name: "inputVersion",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 112, b: 124 }],
    },
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 197, b: 206 }],
    },
    {
      name: "id",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 219, b: 222 }],
    },
    {
      name: "expectedRevision",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 241, b: 258 }],
    },
  ],
  statement:
    "UPDATE decision_intelligence.optimizations\nSET route_id = :routeId!,\n    status = :status!,\n    input_version = :inputVersion,\n    revision = revision + 1,\n    updated_at = now()\nWHERE tenant_id = :tenantId!\n  AND id = :id!\n  AND revision = :expectedRevision!\nRETURNING revision",
};

/**
 * Query generated from SQL:
 * ```
 * UPDATE decision_intelligence.optimizations
 * SET route_id = :routeId!,
 *     status = :status!,
 *     input_version = :inputVersion,
 *     revision = revision + 1,
 *     updated_at = now()
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 *   AND revision = :expectedRevision!
 * RETURNING revision
 * ```
 */
export const updateOptimization = new PreparedQuery<
  IUpdateOptimizationParams,
  IUpdateOptimizationResult
>(updateOptimizationIR);
