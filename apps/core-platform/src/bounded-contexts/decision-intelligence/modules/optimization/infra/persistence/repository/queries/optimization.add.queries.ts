/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/optimization/infra/persistence/repository/queries/optimization.add.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

/** 'AddOptimization' parameters type */
export interface IAddOptimizationParams {
  id: string;
  inputVersion?: number | null | void;
  routeId: string;
  status: string;
  tenantId: string;
}

/** 'AddOptimization' return type */
export type IAddOptimizationResult = void;

/** 'AddOptimization' query type */
export interface IAddOptimizationQuery {
  params: IAddOptimizationParams;
  result: IAddOptimizationResult;
}

const addOptimizationIR: any = {
  usedParamSet: {
    tenantId: true,
    id: true,
    routeId: true,
    status: true,
    inputVersion: true,
  },
  params: [
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 132, b: 141 }],
    },
    {
      name: "id",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 146, b: 149 }],
    },
    {
      name: "routeId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 154, b: 162 }],
    },
    {
      name: "status",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 167, b: 174 }],
    },
    {
      name: "inputVersion",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 179, b: 191 }],
    },
  ],
  statement:
    "INSERT INTO decision_intelligence.optimizations (\n  tenant_id,\n  id,\n  route_id,\n  status,\n  input_version,\n  revision\n)\nVALUES (\n  :tenantId!,\n  :id!,\n  :routeId!,\n  :status!,\n  :inputVersion,\n  1\n)",
};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO decision_intelligence.optimizations (
 *   tenant_id,
 *   id,
 *   route_id,
 *   status,
 *   input_version,
 *   revision
 * )
 * VALUES (
 *   :tenantId!,
 *   :id!,
 *   :routeId!,
 *   :status!,
 *   :inputVersion,
 *   1
 * )
 * ```
 */
export const addOptimization = new PreparedQuery<
  IAddOptimizationParams,
  IAddOptimizationResult
>(addOptimizationIR);
