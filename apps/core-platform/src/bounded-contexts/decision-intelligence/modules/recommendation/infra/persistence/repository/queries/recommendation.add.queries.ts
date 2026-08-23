/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/recommendation/infra/persistence/repository/queries/recommendation.add.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

/** 'AddRecommendation' parameters type */
export interface IAddRecommendationParams {
  confidence?: number | null | void;
  id: string;
  optimizationId: string;
  routeId: string;
  score: number;
  status: string;
  summary?: string | null | void;
  tenantId: string;
  type: string;
}

/** 'AddRecommendation' return type */
export type IAddRecommendationResult = void;

/** 'AddRecommendation' query type */
export interface IAddRecommendationQuery {
  params: IAddRecommendationParams;
  result: IAddRecommendationResult;
}

const addRecommendationIR: any = {
  usedParamSet: {
    tenantId: true,
    id: true,
    routeId: true,
    optimizationId: true,
    type: true,
    status: true,
    summary: true,
    confidence: true,
    score: true,
  },
  params: [
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 178, b: 187 }],
    },
    {
      name: "id",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 192, b: 195 }],
    },
    {
      name: "routeId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 200, b: 208 }],
    },
    {
      name: "optimizationId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 213, b: 228 }],
    },
    {
      name: "type",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 233, b: 238 }],
    },
    {
      name: "status",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 243, b: 250 }],
    },
    {
      name: "summary",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 255, b: 262 }],
    },
    {
      name: "confidence",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 267, b: 277 }],
    },
    {
      name: "score",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 282, b: 288 }],
    },
  ],
  statement:
    "INSERT INTO decision_intelligence.recommendations (\n  tenant_id,\n  id,\n  route_id,\n  optimization_id,\n  type,\n  status,\n  summary,\n  confidence,\n  score,\n  revision\n)\nVALUES (\n  :tenantId!,\n  :id!,\n  :routeId!,\n  :optimizationId!,\n  :type!,\n  :status!,\n  :summary,\n  :confidence,\n  :score!,\n  1\n)",
};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO decision_intelligence.recommendations (
 *   tenant_id,
 *   id,
 *   route_id,
 *   optimization_id,
 *   type,
 *   status,
 *   summary,
 *   confidence,
 *   score,
 *   revision
 * )
 * VALUES (
 *   :tenantId!,
 *   :id!,
 *   :routeId!,
 *   :optimizationId!,
 *   :type!,
 *   :status!,
 *   :summary,
 *   :confidence,
 *   :score!,
 *   1
 * )
 * ```
 */
export const addRecommendation = new PreparedQuery<
  IAddRecommendationParams,
  IAddRecommendationResult
>(addRecommendationIR);
