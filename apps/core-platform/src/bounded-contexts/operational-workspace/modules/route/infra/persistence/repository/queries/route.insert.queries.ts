/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/route/infra/persistence/repository/queries/route.insert.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

/** 'InsertRoute' parameters type */
export interface IInsertRouteParams {
  activeStopSequence?: number | null | void;
  id: string;
  nextPermittedStopSequence: number;
  plannedStopCount: number;
  status: string;
  tenantId: string;
}

/** 'InsertRoute' return type */
export type IInsertRouteResult = void;

/** 'InsertRoute' query type */
export interface IInsertRouteQuery {
  params: IInsertRouteParams;
  result: IInsertRouteResult;
}

const insertRouteIR: any = {
  usedParamSet: {
    tenantId: true,
    id: true,
    status: true,
    plannedStopCount: true,
    nextPermittedStopSequence: true,
    activeStopSequence: true,
  },
  params: [
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 152, b: 161 }],
    },
    {
      name: "id",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 166, b: 169 }],
    },
    {
      name: "status",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 174, b: 181 }],
    },
    {
      name: "plannedStopCount",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 186, b: 203 }],
    },
    {
      name: "nextPermittedStopSequence",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 208, b: 234 }],
    },
    {
      name: "activeStopSequence",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 239, b: 257 }],
    },
  ],
  statement:
    "INSERT INTO operational_workspace.routes (\n  tenant_id,\n  id,\n  status,\n  planned_stop_count,\n  next_stop_sequence,\n  active_stop_sequence\n)\nVALUES (\n  :tenantId!,\n  :id!,\n  :status!,\n  :plannedStopCount!,\n  :nextPermittedStopSequence!,\n  :activeStopSequence\n)",
};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.routes (
 *   tenant_id,
 *   id,
 *   status,
 *   planned_stop_count,
 *   next_stop_sequence,
 *   active_stop_sequence
 * )
 * VALUES (
 *   :tenantId!,
 *   :id!,
 *   :status!,
 *   :plannedStopCount!,
 *   :nextPermittedStopSequence!,
 *   :activeStopSequence
 * )
 * ```
 */
export const insertRoute = new PreparedQuery<
  IInsertRouteParams,
  IInsertRouteResult
>(insertRouteIR);
