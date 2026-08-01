# ADR-0001: Core Platform implemented as a Modular Monolith

## Context

The Logistics Decision Intelligence Platform is a new product developed by a single engineer.

The system requires strong domain boundaries (DDD), but the expected initial scale does not justify a distributed microservice architecture.

## Decision

The Core Platform will be implemented as a modular monolith.

Modules communicate through well-defined interfaces within a single deployable application.

The AI Platform will be implemented as an independent service.

## Consequences

### Benefits

- Lower operational complexity.
- Simpler local development.
- ACID transactions across domain modules.
- Easier refactoring during early product evolution.
- Strong DDD boundaries without premature distribution.
- Straightforward extraction of modules into microservices if needed.

### Drawbacks

- Entire platform scales as one deployment.
- Module boundaries are enforced by conventions rather than network isolation.

## Alternatives considered

### Full microservices

Rejected due to unnecessary operational complexity for a solo-developed product.

### Single monolith

Rejected because AI workloads have different runtime, scalability and dependency characteristics.
