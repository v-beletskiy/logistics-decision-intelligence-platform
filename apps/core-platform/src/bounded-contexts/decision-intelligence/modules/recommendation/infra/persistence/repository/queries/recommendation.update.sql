/* @name UpdateRecommendation */
UPDATE decision_intelligence.recommendations
SET route_id = :routeId!,
    optimization_id = :optimizationId!,
    type = :type!,
    status = :status!,
    analysis_request_event_id = :analysisRequestEventId,
    analysis_status = :analysisStatus!,
    summary = :summary,
    confidence = :confidence,
    score = :score!,
    revision = revision + 1,
    updated_at = now()
WHERE tenant_id = :tenantId!
  AND id = :id!
  AND revision = :expectedRevision!
RETURNING revision;
