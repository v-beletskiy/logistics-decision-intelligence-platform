/** Types generated for queries found in "src/bounded-contexts/decision-intelligence/modules/recommendation/infra/persistence/repository/queries/recommendation.delete.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteRecommendation' parameters type */
export interface IDeleteRecommendationParams {
  id: string;
  tenantId: string;
}

/** 'DeleteRecommendation' return type */
export type IDeleteRecommendationResult = void;

/** 'DeleteRecommendation' query type */
export interface IDeleteRecommendationQuery {
  params: IDeleteRecommendationParams;
  result: IDeleteRecommendationResult;
}

const deleteRecommendationIR: any = {"usedParamSet":{"tenantId":true,"id":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":68,"b":77}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":90,"b":93}]}],"statement":"DELETE FROM decision_intelligence.recommendations\nWHERE tenant_id = :tenantId!\n  AND id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM decision_intelligence.recommendations
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 * ```
 */
export const deleteRecommendation = new PreparedQuery<IDeleteRecommendationParams,IDeleteRecommendationResult>(deleteRecommendationIR);
