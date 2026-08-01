# Inter-Context Workflows

## Story 1 — Route Optimization

### Goal

Automatically start optimization whenever an operational Route changes.

### Workflow

```text
Operational Workspace

Route
 │
 │ RouteCreatedIntegrationEvent
 │ RouteStructureChangedIntegrationEvent
 ▼
Application Event Bus
 │
 ▼
Decision Intelligence

Optimization
```

---

## Story 2 — Recommendation Acceptance

### Goal

Apply an accepted Recommendation to the operational Route.

### Workflow

```text
Decision Intelligence

Recommendation
 │
 │ RecommendationAcceptedIntegrationEvent
 ▼
Application Event Bus
 │
 ▼
Operational Workspace

Route
```

---

## Story 3 — AI Recommendation Analysis

### Goal

Generate AI analysis for newly created Recommendations and attach it back to the Recommendation.

### Workflow

```text
Decision Intelligence

Recommendation
 │
 │ RecommendationAnalysisRequestedIntegrationEvent
 ▼
Distributed Message Broker
 │
 ▼
AI Platform

Recommendation Analysis
 │
 │ sync GetRouteAnalysisContext()
 ├──────────────────────────────────────────────► Operational Workspace
 │                                               │
 │ ◄─────────────────────────────────────────────┤
 │          RouteAnalysisContext                 │
 │
 │ RecommendationAnalysisCompletedIntegrationEvent
 ▼
Distributed Message Broker
 │
 ▼
Decision Intelligence

Recommendation
```
