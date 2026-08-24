/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/recommendation/infra/persistence/repository/queries/recommendation.update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'UpdateRecommendation' parameters type */
export interface IUpdateRecommendationParams {
  analysisRequestEventId?: string | null | void;
  analysisStatus: string;
  confidence?: number | null | void;
  expectedRevision: NumberOrString;
  id: string;
  optimizationId: string;
  routeId: string;
  score: number;
  status: string;
  summary?: string | null | void;
  tenantId: string;
  type: string;
}

/** 'UpdateRecommendation' return type */
export interface IUpdateRecommendationResult {
  revision: string;
}

/** 'UpdateRecommendation' query type */
export interface IUpdateRecommendationQuery {
  params: IUpdateRecommendationParams;
  result: IUpdateRecommendationResult;
}

const updateRecommendationIR: any = {"usedParamSet":{"routeId":true,"optimizationId":true,"type":true,"status":true,"analysisRequestEventId":true,"analysisStatus":true,"summary":true,"confidence":true,"score":true,"tenantId":true,"id":true,"expectedRevision":true},"params":[{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":60,"b":68}]},{"name":"optimizationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":93,"b":108}]},{"name":"type","required":true,"transform":{"type":"scalar"},"locs":[{"a":122,"b":127}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":143,"b":150}]},{"name":"analysisRequestEventId","required":false,"transform":{"type":"scalar"},"locs":[{"a":185,"b":207}]},{"name":"analysisStatus","required":true,"transform":{"type":"scalar"},"locs":[{"a":232,"b":247}]},{"name":"summary","required":false,"transform":{"type":"scalar"},"locs":[{"a":264,"b":271}]},{"name":"confidence","required":false,"transform":{"type":"scalar"},"locs":[{"a":291,"b":301}]},{"name":"score","required":true,"transform":{"type":"scalar"},"locs":[{"a":316,"b":322}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":395,"b":404}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":417,"b":420}]},{"name":"expectedRevision","required":true,"transform":{"type":"scalar"},"locs":[{"a":439,"b":456}]}],"statement":"UPDATE decision_intelligence.recommendations\nSET route_id = :routeId!,\n    optimization_id = :optimizationId!,\n    type = :type!,\n    status = :status!,\n    analysis_request_event_id = :analysisRequestEventId,\n    analysis_status = :analysisStatus!,\n    summary = :summary,\n    confidence = :confidence,\n    score = :score!,\n    revision = revision + 1,\n    updated_at = now()\nWHERE tenant_id = :tenantId!\n  AND id = :id!\n  AND revision = :expectedRevision!\nRETURNING revision"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE decision_intelligence.recommendations
 * SET route_id = :routeId!,
 *     optimization_id = :optimizationId!,
 *     type = :type!,
 *     status = :status!,
 *     analysis_request_event_id = :analysisRequestEventId,
 *     analysis_status = :analysisStatus!,
 *     summary = :summary,
 *     confidence = :confidence,
 *     score = :score!,
 *     revision = revision + 1,
 *     updated_at = now()
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 *   AND revision = :expectedRevision!
 * RETURNING revision
 * ```
 */
export const updateRecommendation = new PreparedQuery<IUpdateRecommendationParams,IUpdateRecommendationResult>(updateRecommendationIR);
