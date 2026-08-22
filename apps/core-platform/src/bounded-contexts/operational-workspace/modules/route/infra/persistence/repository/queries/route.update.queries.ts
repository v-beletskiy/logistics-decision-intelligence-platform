/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/route/infra/persistence/repository/queries/route.update.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

export type NumberOrString = number | string;

/** 'UpdateRoute' parameters type */
export interface IUpdateRouteParams {
  activeStopSequence?: number | null | void;
  expectedRevision: NumberOrString;
  id: string;
  nextPermittedStopSequence: number;
  plannedStopCount: number;
  status: string;
  tenantId: string;
}

/** 'UpdateRoute' return type */
export interface IUpdateRouteResult {
  revision: string;
}

/** 'UpdateRoute' query type */
export interface IUpdateRouteQuery {
  params: IUpdateRouteParams;
  result: IUpdateRouteResult;
}

const updateRouteIR: any = {
  usedParamSet: {
    status: true,
    plannedStopCount: true,
    nextPermittedStopSequence: true,
    activeStopSequence: true,
    tenantId: true,
    id: true,
    expectedRevision: true,
  },
  params: [
    {
      name: "status",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 49, b: 56 }],
    },
    {
      name: "plannedStopCount",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 84, b: 101 }],
    },
    {
      name: "nextPermittedStopSequence",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 129, b: 155 }],
    },
    {
      name: "activeStopSequence",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 185, b: 203 }],
    },
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 276, b: 285 }],
    },
    {
      name: "id",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 298, b: 301 }],
    },
    {
      name: "expectedRevision",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 320, b: 337 }],
    },
  ],
  statement:
    "UPDATE operational_workspace.routes\nSET status = :status!,\n    planned_stop_count = :plannedStopCount!,\n    next_stop_sequence = :nextPermittedStopSequence!,\n    active_stop_sequence = :activeStopSequence,\n    revision = revision + 1,\n    updated_at = now()\nWHERE tenant_id = :tenantId!\n  AND id = :id!\n  AND revision = :expectedRevision!\nRETURNING revision",
};

/**
 * Query generated from SQL:
 * ```
 * UPDATE operational_workspace.routes
 * SET status = :status!,
 *     planned_stop_count = :plannedStopCount!,
 *     next_stop_sequence = :nextPermittedStopSequence!,
 *     active_stop_sequence = :activeStopSequence,
 *     revision = revision + 1,
 *     updated_at = now()
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 *   AND revision = :expectedRevision!
 * RETURNING revision
 * ```
 */
export const updateRoute = new PreparedQuery<
  IUpdateRouteParams,
  IUpdateRouteResult
>(updateRouteIR);
