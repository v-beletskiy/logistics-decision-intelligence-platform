# ADR-0002 — Project Structure & Dependency Rules

## Context

The system is implemented as a modular monolith following Domain-Driven Design (DDD), CQRS and Hexagonal Architecture.

A scalable project structure is required that:

- preserves domain encapsulation;
- avoids circular dependencies;
- keeps business capabilities easy to locate;
- scales to big number of aggregates and use cases;
- enables future extraction of bounded contexts into independent services.

---

## Decision

### General Project Structure

The codebase is organized around **bounded contexts**, each containing multiple **domain modules** centered around aggregate roots (e.g. Optimization, Recommendation).

The project distinguishes **shared business concepts** from **shared technical infrastructure** to avoid coupling the domain model with implementation concerns.

The project follows a **Vertical Slice Architecture** at the application and infrastructure levels. Functionality is organized around business capabilities (domain modules) rather than technical layers. Each slice owns its application use cases, domain model and infrastructure adapters, maximizing cohesion while preserving explicit architectural boundaries.

### Shared Code Structure

```text
src/

├── shared/
│   ├── domain/
│   │   └── shared-kernel/
│   │       ├── value-objects/
│   │       ├── enums/
│   │       ├── exceptions/
│   │       └── policies/
│   │
│   ├── app/
│   │   └── messaging/       # application-owned input/output ports
│   │
│   ├── infra/
│   │   ├── http/
│   │   ├── messaging/
│   │   │   ├── internal/
│   │   │   └── integration/
│   │   │       ├── inbound/
│   │   │       ├── outbound/
│   │   │       └── rabbitmq/
│   │   ├── persistence/
│   │   └── ...
│   │
│   └── access-control/
│
├── operational-workspace/
│
├── decision-intelligence/
│
└── ...
```

The project intentionally separates three categories of shared code:

| Module | Purpose |
|--------|---------|
| **Shared Domain (Shared Kernel)** | Reusable business concepts with identical meaning across bounded contexts (Value Objects, generic domain enums, generic domain exceptions, domain policies). |
| **Shared Application** | Application-owned ports and orchestration primitives reused by bounded-context use cases. It contains no transport or persistence implementations. |
| **Shared Infrastructure** | Reusable technical components (database connection, transaction manager, migration manager, HTTP utilities, messaging utilities, etc.). Contains **no business logic**. |
| **Shared library-like modules, e.g. Access Control** | These modules are organized by capability rather than architectural layer because they represent complete cross-cutting subsystems shared by all bounded contexts. |                            |

Neither layer depends on bounded contexts.

### Bounded Context Structure

Each bounded context is organized into:

- **app** — CQRS application use cases.
- **domain-modules** — business capabilities centered around aggregate roots.
- **shared-domain** — reusable domain concepts shared within the bounded context.
- **infra** — technical adapters shared across the bounded context.

Example:

```
decision-intelligence/

├── app/
│   ├── optimization/
│   │   ├── commands/
│   │   │   └── queue-optimization/
│   │   │       ├── queue-optimization.command.ts
│   │   │       └── queue-optimization.handler.ts
│   │   │
│   │   └── queries/
│   │       └── get-optimization/
│   │           ├── get-optimization.query.ts
│   │           ├── get-optimization.handler.ts
│   │           └── get-optimization.result.ts
│   │
│   └── recommendation/
│       ├── commands/
│       └── queries/
│
├── domain-modules/
│
│   ├── optimization/
│   │   ├── domain/
│   │   │   ├── optimization.aggregate.ts
│   │   │   ├── optimization.repository.ts
│   │   │   ├── optimization.factory.ts
│   │   │   ├── optimization.policy.ts
│   │   │   ├── optimization-execution.service.ts
│   │   │   ├── exceptions/
│   │   │   └── events/
│   │   │
│   │   └── infra/
│   │       └── persistence/
│   │           ├── optimization.pg-repository.ts
│   │           ├── optimization.mapper.ts
│   │           └── queries/
│   │               ├── optimization.find-by-id.sql
│   │               ├── optimization.find-running-by-route.sql
│   │               ├── optimization.save.sql
│   │               └── optimization.delete.sql
│   │
│   └── recommendation/
│       ├── domain/
│       └── infra/
│           └── persistence/
│               ├── recommendation.pg-repository.ts
│               ├── recommendation.mapper.ts
│               └── queries/
│                   ├── recommendation.find-by-id.sql
│                   ├── recommendation.find-pending.sql
│                   ├── recommendation.save.sql
│                   └── recommendation.delete.sql
│
├── shared-domain/
│   ├── services/
│   └── shared-kernel/
│       ├── value-objects/
│       ├── enums/
│       ├── exceptions/
│       └── policies/
│
└── infra/
    ├── optimization/
    │   ├── http/
    │   │   ├── optimization.controller.ts
    │   │   └── dto/
    │   ├── messaging/
    │   └── scheduling/
    │
    └── recommendation/
        ├── http/
        │   ├── recommendation.controller.ts
        │   └── dto/
        ├── messaging/
        └── scheduling/
```

#### Application Layer Placement

The Application layer is organized at the **bounded context level**, not inside individual domain modules.

Although the project follows a Vertical Slice Architecture, application use cases frequently orchestrate multiple domain modules. Keeping the Application layer above domain modules preserves clear ownership of orchestration responsibilities and avoids coupling application logic to a single business capability.

Application use cases are still grouped by the business capability they most naturally belong to (e.g. `app/optimization`, `app/recommendation`), even when they coordinate multiple domain modules. This organization reflects the primary intent of the use case rather than the full set of aggregates it collaborates with.

Domain modules own business behavior. The Application layer owns business process orchestration.

#### Shared Kernel

Shared Kernel may group closely related concepts into namespace-like files (e.g. `location.ts`, `measurement.ts`, `time.ts`).

#### Shared vs Domain /infra

Infrastructure is organized according to its ownership scope.

- **Shared Infrastructure** (`/infra`) contains technical adapters shared across the entire Bounded Context, such as HTTP controllers, gRPC adapters, messaging, scheduling, dependency injection, and configuration.

- **Domain Infrastructure** (`/domain-modules/<module>/infra`) contains infrastructure owned exclusively by a single domain module. Typical examples include repository implementations, persistence mappers, and SQL queries.

This keeps each business capability self-contained while preserving high cohesion and maintaining a clear separation between domain logic and technical concerns.

### Dependency Rules

```
                               Shared Infrastructure
                                           ▲
                                           │
Domain Module Infrastructure ──────────────┘
        │
        ▼
Application Use Cases
        │
        ├──────────────────────┐
        ▼                      ▼
Domain Module A          Domain Module B
        ▲                      ▲
        └──────────┬───────────┘
                   │
Cross-Aggregate Domain Services
                   │
                   ▼
        Shared Domain (Shared Kernel)
```

Rules:

- Domain modules must not depend on other domain modules.
- Application use cases depend on one or multiple domain modules.
- Application use cases depend on application-owned ports and never import
  adapters from shared infrastructure.
- Cross-aggregate domain services may depend on multiple domain modules.
- Domain module infrastructure depends on the application layer.
- Domain module depends only on the shared domain (shared kernel outside of the bounded context).
- Shared infrastructure contains no business logic and may be reused by multiple bounded contexts.
- Shared infrastructure implements application ports; dependency direction
  never points from the application layer toward infrastructure.
- Shared domain and shared infrastructure are independent of bounded contexts.

### Domain Services

Domain Services encapsulate business decisions only.

Domain Services may be:

- **Domain-Local**, supporting a single domain (aggregate) and located inside its domain module.
- **Cross-Domain**, encapsulating business decisions spanning multiple domains (aggregates) within the bounded context and located under `shared-domain/services`.

Regardless of scope, Domain Services:

- remain infrastructure-independent;
- operate only on already-loaded domain objects;
- must not depend on repositories, databases, messaging, HTTP clients or other infrastructure.

Application use cases are responsible for loading all required aggregates before invoking Domain Services.

Example:

```text
Application Use Case

    load Route
    load Vehicle
    load Driver
    load Shipments

            │
            ▼

AssignmentPlanningPolicy.assertCanCreateAssignment(
    route,
    vehicle,
    driver,
    shipments,
    conflicts
)
```

This keeps Domain Services deterministic, reusable and free from infrastructure concerns.
The policy evaluates eligibility only; the application use case subsequently
invokes the Assignment aggregate to perform any approved state transition.

### Naming Conventions

Folders use **kebab-case**.

Files follow:

- `<name>.aggregate.ts`
- `<name>.repository.ts`
- `<name>.factory.ts`
- `<name>.policy.ts`
- `<name>.service.ts`
- `<name>.command.ts`
- `<name>.query.ts`
- `<name>.handler.ts`
- `<name>.controller.ts`
- `<name>.event.ts`

---

## Consequences

### Advantages

- Strong encapsulation of business capabilities through independent domain modules.
- Clear ownership and locality of domain logic, making business rules easier to discover and evolve.
- Explicit dependency direction prevents circular dependencies and enforces architectural boundaries.
- Domain services remain deterministic, reusable and infrastructure-independent.
- Clear separation of responsibilities between orchestration (Application), business decisions (Domain) and technical concerns (Infrastructure).
- Scales well as the number of bounded contexts with aggregates, use cases etc. grows.
- Simplifies future extraction of bounded contexts into independently deployable services with minimal structural changes.

### Trade-offs

- The number of files and folders is higher than in a traditional layered architecture, increasing navigation overhead.
- Aggregate boundaries require discipline. Business rules spanning multiple domain modules must be modeled explicitly as cross-aggregate domain services rather than implemented through direct module dependencies.
- Some business operations require loading multiple aggregates. Until dedicated read models are introduced, this may result in additional database round-trips.
- Refactoring aggregate boundaries later may require coordinated changes across application use cases and cross-aggregate domain services.

---

## Future Evolution

- Application use cases may evolve to consume optimized read models/projections instead of loading multiple aggregates individually, reducing database round-trips while preserving domain isolation.
- Shared Infrastructure may grow to include reusable technical capabilities (e.g. persistence, messaging, HTTP infrastructure) without affecting the domain model.
- Bounded contexts may be extracted into independently deployable services while preserving the same internal layering and dependency rules.
