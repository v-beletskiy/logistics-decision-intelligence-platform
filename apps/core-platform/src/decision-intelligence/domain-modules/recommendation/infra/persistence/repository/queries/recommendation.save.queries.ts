/** Types generated for queries found in "src/decision-intelligence/domain-modules/recommendation/infra/persistence/repository/queries/recommendation.save.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'SaveRecommendation' parameters type */
export interface ISaveRecommendationParams {
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

/** 'SaveRecommendation' return type */
export type ISaveRecommendationResult = void;

/** 'SaveRecommendation' query type */
export interface ISaveRecommendationQuery {
  params: ISaveRecommendationParams;
  result: ISaveRecommendationResult;
}

const saveRecommendationIR: any = {"usedParamSet":{"tenantId":true,"id":true,"routeId":true,"optimizationId":true,"type":true,"status":true,"summary":true,"confidence":true,"score":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":189,"b":198}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":203,"b":206}]},{"name":"routeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":211,"b":219}]},{"name":"optimizationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":224,"b":239}]},{"name":"type","required":true,"transform":{"type":"scalar"},"locs":[{"a":244,"b":249}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":254,"b":261}]},{"name":"summary","required":false,"transform":{"type":"scalar"},"locs":[{"a":266,"b":273}]},{"name":"confidence","required":false,"transform":{"type":"scalar"},"locs":[{"a":278,"b":288}]},{"name":"score","required":true,"transform":{"type":"scalar"},"locs":[{"a":293,"b":299}]}],"statement":"INSERT INTO decision_intelligence.recommendations AS current (\n  tenant_id,\n  id,\n  route_id,\n  optimization_id,\n  type,\n  status,\n  summary,\n  confidence,\n  score,\n  revision\n)\nVALUES (\n  :tenantId!,\n  :id!,\n  :routeId!,\n  :optimizationId!,\n  :type!,\n  :status!,\n  :summary,\n  :confidence,\n  :score!,\n  1\n)\nON CONFLICT (tenant_id, id)\nDO UPDATE SET\n  route_id = EXCLUDED.route_id,\n  optimization_id = EXCLUDED.optimization_id,\n  type = EXCLUDED.type,\n  status = EXCLUDED.status,\n  summary = EXCLUDED.summary,\n  confidence = EXCLUDED.confidence,\n  score = EXCLUDED.score,\n  revision = current.revision + 1,\n  updated_at = now()"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO decision_intelligence.recommendations AS current (
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
 * ON CONFLICT (tenant_id, id)
 * DO UPDATE SET
 *   route_id = EXCLUDED.route_id,
 *   optimization_id = EXCLUDED.optimization_id,
 *   type = EXCLUDED.type,
 *   status = EXCLUDED.status,
 *   summary = EXCLUDED.summary,
 *   confidence = EXCLUDED.confidence,
 *   score = EXCLUDED.score,
 *   revision = current.revision + 1,
 *   updated_at = now()
 * ```
 */
export const saveRecommendation = new PreparedQuery<ISaveRecommendationParams,ISaveRecommendationResult>(saveRecommendationIR);


