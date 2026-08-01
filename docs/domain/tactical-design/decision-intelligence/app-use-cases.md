# Decision Intelligence - Application Use Cases

# Optimization

---

## Commands

### Queue Optimization

#### Purpose

Queue a new Optimization when Route changes require a new optimization execution.

#### Command

- QueueOptimizationCommand

#### Handler

- QueueOptimizationHandler

#### Triggers

- RouteCreatedIntegrationEvent
- RouteStructureChangedIntegrationEvent

#### Flow

1. Load active Optimization via OptimizationRepository.findActiveByRouteId() if one exists.
2. Cancel the active Optimization if one exists.
3. Create Optimization aggregate.
4. Persist Optimization via OptimizationRepository.save() with Queued status.
5. Publish OptimizationQueuedDomainEvent event.

---

### Execute Optimization

#### Purpose

Execute a queued Optimization and produce actionable Recommendations.

#### Command

- ExecuteOptimizationCommand

#### Handler

- ExecuteOptimizationHandler

#### Triggers

- OptimizationQueuedDomainEvent

#### Flow

1. Load Optimization via OptimizationRepository.findById().
2. Fetch RouteOptimizationInput from the Operational Workspace through its published read contract.
3. Execute Optimization.start().
4. Persist Optimization via OptimizationRepository.save() with Running status.
5. Publish OptimizationStartedDomainEvent.
6. Execute OptimizationExecutionService.exec(route, optimization).
7. Persist generated Recommendations via RecommendationRepository.saveMany().
8. Execute Optimization.complete().
9. Persist Optimization via OptimizationRepository.save() with Completed status.
10. Publish RecommendationCreatedDomainEvent for each Recommendation.
11. Publish RecommendationAnalysisRequestedIntegrationEvent for each Recommendation for AI analysis.
12. Publish OptimizationCompletedDomainEvent.

#### Failure Flow

1. Execute Optimization.fail().
2. Persist Optimization via OptimizationRepository.save() with Failed status.
3. Publish OptimizationFailedDomainEvent event.

---

### Complete Recommendation Analysis

#### Purpose

Attach AI-generated analysis to an existing Recommendation after asynchronous processing completes.

#### Command

- CompleteRecommendationAnalysisCommand

#### Handler

- CompleteRecommendationAnalysisHandler

#### Triggers

- RecommendationAnalysisCompletedIntegrationEvent

#### Flow

1. Load Recommendation via RecommendationRepository.findById().
2. Execute Recommendation.attachAnalysis().
3. Persist Recommendation via RecommendationRepository.save().
4. Publish RecommendationAnalysisAttachedDomainEvent.

---

# Recommendation

---

## Commands

### Accept Recommendation

#### Purpose

Accept a Recommendation and apply it to the operational plan.

#### Command

- AcceptRecommendationCommand

#### Handler

- AcceptRecommendationHandler

#### Triggers

- REST API

#### Flow

1. Load Recommendation via RecommendationRepository.findById().
2. Fetch RouteOptimizationInput from the Operational Workspace through its published read contract.
3. Execute Recommendation.accept().
4. Persist Recommendation via RecommendationRepository.save().
5. Publish RecommendationAcceptedDomainEvent.
6. Publish RecommendationAcceptedIntegrationEvent. Then Recommendation should be applied to the operational workspace.

---

### Reject Recommendation

#### Purpose

Reject a Recommendation.

#### Command

- RejectRecommendationCommand

#### Handler

- RejectRecommendationHandler

#### Triggers

- REST API

#### Flow

1. Load Recommendation via RecommendationRepository.findById().
2. Execute Recommendation.reject().
3. Persist Recommendation via RecommendationRepository.save().
4. Publish RecommendationRejectedDomainEvent event.

---

### Expire Recommendations

#### Purpose

Expire Recommendations that are no longer valid.

#### Command

- ExpireRecommendationsCommand

#### Handler

- ExpireRecommendationsHandler

#### Triggers

- Scheduled Job

#### Flow

1. Load a page of pending Recommendations via RecommendationRepository.findPending(page).
2. Execute Recommendation.expire() for each Recommendation.
3. Persist Recommendations via RecommendationRepository.saveMany().
4. Publish RecommendationExpiredDomainEvent events.
5. Repeat until no pending Recommendations remain.

---

## Queries

### Get Recommendation

#### Purpose

Return Recommendation details.

#### Query

- GetRecommendationQuery

#### Handler

- GetRecommendationHandler

#### Triggers

- REST API

#### Flow

1. Load Recommendation read model.
2. Return result.

---
