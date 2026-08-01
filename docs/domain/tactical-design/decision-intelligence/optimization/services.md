# Decision Intelligence - Optimization Services

## OptimizationExecutionService

### Purpose

Executes an Optimization and produces actionable Recommendations.

### Business Rules

- Only one active Optimization may execute for a Route at a time.
- When starting a new Optimization, any previous active Optimization for the Route is cancelled.
- AI analysis is attached only after deterministic optimization has completed successfully.
- One Optimization execution may produce multiple Recommendation types.

### Operations

- ExecuteOptimization

### Internal Concepts

- **CandidateRecommendation** — transient deterministic optimization candidate produced during execution before becoming a persisted Recommendation.
  - Fields:
    - routeId: RouteId
    - type: RecommendationType
    - facts: RecommendationFact[]
    - score: number
  - Invariants:
    - References exactly one Route.
    - RecommendationType must be specified.
    - Score must be valid.

### Notes

- Uses **ConstraintSolver** to generate CandidateRecommendations satisfying operational constraints.

### Collaborating Aggregates

- Optimization
- Recommendation

---
