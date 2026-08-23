# Inter-Context Workflows

## Route Optimization

```text
Operational Workspace
        │ RouteInputChangedApplicationEvent
        ▼
Decision Intelligence
        │ Queue Optimization
        ▼
optimizationJobEnqueuedV1
        │
        ▼
OptimizationExecutionConsumer
```

Decision Intelligence reads current planning data through Operational
Workspace's `RoutePlanningSnapshotQuery` and maps it through its own
consumer-owned query adapter.

## AI Recommendation Analysis

```text
Decision Intelligence
        │ recommendationAnalysisRequestedV1
        ▼
AI Platform
        │ gRPC RecommendationAnalysis context query
        ▼
Decision Intelligence
```

The outbound request and synchronous context query are implemented. Consumption
of `recommendationAnalysisCompletedV1` and attachment of the analysis remain
future work and are not wired into composition.

## Recommendation Acceptance

Applying an accepted Recommendation to Operational Workspace is not yet
implemented or exposed. It will require a producer-owned cross-context contract
rather than direct access to Operational Workspace handlers.
