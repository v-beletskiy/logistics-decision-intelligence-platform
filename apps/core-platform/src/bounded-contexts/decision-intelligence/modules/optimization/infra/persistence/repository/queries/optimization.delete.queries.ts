/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/optimization/infra/persistence/repository/queries/optimization.delete.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

/** 'DeleteOptimization' parameters type */
export interface IDeleteOptimizationParams {
  id: string;
  tenantId: string;
}

/** 'DeleteOptimization' return type */
export type IDeleteOptimizationResult = void;

/** 'DeleteOptimization' query type */
export interface IDeleteOptimizationQuery {
  params: IDeleteOptimizationParams;
  result: IDeleteOptimizationResult;
}

const deleteOptimizationIR: any = {
  usedParamSet: { tenantId: true, id: true },
  params: [
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 66, b: 75 }],
    },
    {
      name: "id",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 88, b: 91 }],
    },
  ],
  statement:
    "DELETE FROM decision_intelligence.optimizations\nWHERE tenant_id = :tenantId!\n  AND id = :id!",
};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM decision_intelligence.optimizations
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 * ```
 */
export const deleteOptimization = new PreparedQuery<
  IDeleteOptimizationParams,
  IDeleteOptimizationResult
>(deleteOptimizationIR);
