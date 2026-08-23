/* @name AcquireOptimizationRouteLock */
SELECT pg_advisory_xact_lock(
  hashtextextended(:tenantId! || ':' || :routeId!, 0)
);
