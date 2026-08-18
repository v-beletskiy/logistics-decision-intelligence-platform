/* @name DeleteRecommendation */
DELETE FROM decision_intelligence.recommendations
WHERE tenant_id = :tenantId!
  AND id = :id!;