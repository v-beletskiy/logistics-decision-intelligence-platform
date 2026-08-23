# ADR-0001 — Domain Layer

## Purpose

The Domain Layer models the business.

It contains business rules, decisions, invariants, and ubiquitous language while remaining completely independent of infrastructure and application concerns.

The Domain Layer is the only layer allowed to own business logic.

---

## Responsibilities

The Domain Layer may:

- model Aggregates, Entities, and Value Objects;
- enforce business invariants;
- raise Domain Events;
- implement business decisions;
- define Repository ports;
- define Domain Service contracts;
- define business exceptions;
- define domain policies.

The Domain Layer must not:

- access databases;
- execute SQL;
- call external services;
- publish Integration Events;
- depend on transport protocols or frameworks;
- depend on infrastructure implementations.

---

## Aggregate Rules

Aggregates are the consistency boundary of the domain.

Each Aggregate:

- owns its own state;
- protects its invariants;
- exposes behavior, not setters;
- validates invariant-bearing state during creation and reconstitution;
- raises Domain Events when business facts occur.

Aggregates never:

- load other Aggregates;
- access repositories;
- perform persistence;
- invoke infrastructure.

---

## Aggregate Lifecycle

```text
Application Layer
        │
        ▼
Aggregate behavior
        │
        ▼
State changes
        │
        ▼
Raise Domain Events
        │
        ▼
Return control
```

The Application Layer is responsible for persisting the Aggregate and dispatching the raised Domain Events.

---

## Entities

Entities have identity and mutable state.

They exist only as part of an Aggregate boundary and should not be loaded independently.

---

## Value Objects

Value Objects:

- are immutable;
- have no identity;
- are compared by value;
- encapsulate validation and domain semantics.

Runtime validation remains necessary because TypeScript types disappear at
runtime and persisted or external data may be malformed.

Examples:

- RouteId
- RecommendationId
- OptimizationStatus

---

## Domain Events

Domain Events represent business facts that occurred inside a single Bounded Context.

Aggregates raise Domain Events while executing business behavior.

Examples:

- RouteCreatedDomainEvent
- OptimizationCompletedDomainEvent
- RecommendationAcceptedDomainEvent

Domain Events remain internal to the Bounded Context.

The Domain Layer never publishes Integration Events.

---

## Domain Services

Domain Services encapsulate business behavior that does not naturally belong to a single Aggregate, or business algorithms that conceptually belong to an Aggregate but should be extracted to keep the Aggregate focused and cohesive, e.g. RecommendationScoringService.

Domain Services:

- contain business logic;
- never execute transactions;
- never perform persistence;
- never coordinate infrastructure.

The project distinguishes two kinds of Domain Services.

### Domain-Local

Support a single Aggregate.

### Cross-Domain

Encapsulate business decisions spanning multiple Aggregates within the same Bounded Context.

---

## Domain Policies

Domain policies express decisions or eligibility rules and should be
side-effect free. When a policy approves a state transition, the Aggregate
still owns and performs that transition so its local invariants and Domain
Events remain authoritative.

---

## Repository Ports

Repository ports belong to the Domain Layer. They define Aggregate persistence contracts.

Repository implementations belong to Infrastructure.

Repositories are Aggregate-oriented.

Allowed examples:

- findById()
- findRunningByRouteId()
- findByIdForUpdate()
- save()
- saveMany()
- delete()

---

## Business Exceptions

Business failures are represented by Domain Exceptions with mandatory stable
error codes. Codes are selected from the owning module's catalog; error
categories and uniqueness rules are defined by ADR-0009.

Examples:

- RecommendationAlreadyAcceptedException
- OptimizationAlreadyRunningException

Only the Domain Layer creates Domain Exceptions.

---

## Aggregate Creation

Aggregates may be created through constructors or static factory methods.

Dedicated Domain Factories should only be introduced when Aggregate creation requires substantial business logic.

Avoid factories that merely wrap constructors.

Creation and mutation parameters are intention-specific. Avoid generic
`Details` or partial-update contracts that accumulate unrelated optional
fields. Parameter type stays with the Aggregate or operation that owns
it unless it is independently reusable.

Domain organization remains flat while cohesive. Single event or policy files
do not justify `events/` or `policies/` folders; meaningful sub-areas may be
grouped when several files warrant it.

---

## Dependencies

The Domain Layer may depend only on:

- itself;
- the cross-context Shared Kernel (`src/shared/domain`).

Bounded-context-level `domain/` already contains concepts shared by that
context's modules.

The Domain Layer must never depend on:

- Application Layer;
- Infrastructure (HTTP, gRPC, messaging, SQL, DB libraries, etc.);

---

## Design Principles

- Rich Domain Model over Anemic Domain Model.
- Behavior lives inside Aggregates whenever possible.
- Aggregates protect their own invariants.
- Business rules are never duplicated in the Application Layer.
- Infrastructure remains replaceable without changing Domain code.
- Domain Events represent business facts, not technical events.
