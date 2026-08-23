# Route Optimization Evaluation

`OptimizationCostModel` converts distance and duration metrics into a comparable
business cost. `RouteOptimizationEvaluator` compares the existing stop order
with the optimizer's proposed order and produces:

- baseline and recommended Route metrics;
- distance and duration improvement percentages;
- a bounded Recommendation score.

External routing and solving are Application ports (`CostMatrixProvider` and
`RouteOptimizer`) with Infrastructure adapters. They are not Domain services.
