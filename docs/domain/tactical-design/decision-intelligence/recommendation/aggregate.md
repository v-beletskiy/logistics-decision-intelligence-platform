# Decision Intelligence - Recommendation aggregate root

Represents an actionable optimization outcome generated for a specific Route version.

## Invariants

- A Recommendation references exactly one Route and one Optimization.
- A Recommendation has exactly one RecommendationType and RecommendationStatus.
- An Accepted Recommendation cannot be modified.
- A Rejected or Expired Recommendation cannot become Accepted.

## Commands

- CreateRecommendationCommand
- AcceptRecommendationCommand
- RejectRecommendationCommand
- ExpireRecommendationCommand

## Domain Events

- RecommendationCreatedDomainEvent
- RecommendationAcceptedDomainEvent
- RecommendationRejectedDomainEvent
- RecommendationExpiredDomainEvent

## Entities

- **RecommendationFact** — represents a measurable deterministic optimization result compared to the baseline operational plan.
  - Fields:
    - metric: RecommendationMetric (enum)
    - baselineValue: number
    - recommendedValue: number
    - unit: MeasurementUnit (enum)
    - improvement: number (percentage)
  - Invariants:
    - Metric must be specified.
    - Baseline and recommended values must be valid for the selected metric.

- **RecommendationAnalysis** — represents AI-generated analysis of the Recommendation.
  - Fields:
    - summary: string
    - confidence: number
    - findings: Finding[] (VO)
  - Invariants:
    - Summary must be non-empty.
    - Confidence must be between 0 and 100.

## Value Objects

- **Finding** — represents a single AI finding about the Recommendation.
  - Fields:
    - category: FindingCategory (enum)
    - title: string
    - description: string
  - Invariants:
    - Category must be specified.
    - Title and description must be non-empty.

## Enums

- RecommendationStatus
  - Pending
  - Accepted
  - Rejected
  - Expired

- RecommendationType
  - AssignVehicle
  - AssignDriver
  - OptimizeRoutePlan
  - SplitShipment
  - ConsolidateShipments

- RecommendationMetric
  - TotalDistance
  - TotalDuration
  - FuelConsumption
  - EstimatedArrival
  - EstimatedCost
  - DriverUtilization
  - VehicleUtilization

- FindingCategory
  - Strength
  - Risk
  - Assumption — condition under which the recommendation remains valid.

## Repository Interfaces

- RecommendationRepository
  - findById(id: RecommendationId)
  - findPendingByRouteId(routeId: RouteId)
  - findPending()
  - save(recommendation: Recommendation)
  - saveMany(recommendations: Recommendation[])
  - delete(id: RecommendationId)

## References to other aggregates

- OptimizationId
- RouteId

---
