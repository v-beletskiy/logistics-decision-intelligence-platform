/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/recommendation/infra/persistence/repository/queries/recommendation.add.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AddRecommendation' parameters type */
export interface IAddRecommendationParams {
  analysisRequestEventId?: string | null | void;
  analysisStatus: string;
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

const addRecommendationIR: any = {"usedParamSet":{"tenantId":true,"id":true,"routeId":true,"optimizationId":true,"type":true,"status":true,"analysisRequestEventId":true,"analysisStatus":true,"summary":true,"confidence":true,"score":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":226,"b":235}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":240,"b":243}]},{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":248,"b":256}]},{"name":"optimizationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":261,"b":276}]},{"name":"type","required":true,"transform":{"type":"scalar"},"locs":[{"a":281,"b":286}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":291,"b":298}]},{"name":"analysisRequestEventId","required":false,"transform":{"type":"scalar"},"locs":[{"a":303,"b":325}]},{"name":"analysisStatus","required":true,"transform":{"type":"scalar"},"locs":[{"a":330,"b":345}]},{"name":"summary","required":false,"transform":{"type":"scalar"},"locs":[{"a":350,"b":357}]},{"name":"confidence","required":false,"transform":{"type":"scalar"},"locs":[{"a":362,"b":372}]},{"name":"score","required":true,"transform":{"type":"scalar"},"locs":[{"a":377,"b":383}]}],"statement":"INSERT INTO decision_intelligence.recommendations (\n  tenant_id,\n  id,\n  route_id,\n  optimization_id,\n  type,\n  status,\n  analysis_request_event_id,\n  analysis_status,\n  summary,\n  confidence,\n  score,\n  revision\n)\nVALUES (\n  :tenantId!,\n  :id!,\n  :routeId!,\n  :optimizationId!,\n  :type!,\n  :status!,\n  :analysisRequestEventId,\n  :analysisStatus!,\n  :summary,\n  :confidence,\n  :score!,\n  1\n)"};

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
 *   analysis_request_event_id,
 *   analysis_status,
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
 *   :analysisRequestEventId,
 *   :analysisStatus!,
 *   :summary,
 *   :confidence,
 *   :score!,
 *   1
 * )
 * ```
 */
export const addRecommendation = new PreparedQuery<IAddRecommendationParams,IAddRecommendationResult>(addRecommendationIR);
