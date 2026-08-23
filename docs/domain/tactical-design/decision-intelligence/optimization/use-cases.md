# Optimization Use Cases

## Queue Optimization

`RouteInputChangedHandler` maps `RouteInputChangedApplicationEvent` to
`QueueOptimizationCommand` and delegates to `QueueOptimizationHandler`.

The handler:

1. loads the latest input through `RouteOptimizationInputQuery`;
2. loads the active Optimization through
   `OptimizationRepository.findActiveByRouteIdForUpdate`;
3. applies `OptimizationTriggerPolicy` to input versions;
4. cancels the active Optimization when required and queues the new Aggregate;
5. publishes `optimizationJobEnqueuedV1` through the transactional outbox.

The repository serializes this sequence per tenant and Route as defined by Core
Platform ADR-0003.

## Execute Optimization

`OptimizationExecutionConsumer` maps `optimizationJobEnqueuedV1` to
`ExecuteOptimizationCommand`.

The handler loads the queued Optimization and current Route input, obtains the
OSRM cost matrix, executes VROOM, and evaluates the result. On success, one
transaction persists the Recommendations, publishes their
`recommendationAnalysisRequestedV1` events with `publishMany`, and completes the
Optimization. Missing or invalid input and provider failures mark the
Optimization as failed.
