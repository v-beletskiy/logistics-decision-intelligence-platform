# ADR-0005 — Dependency Injection & Module Composition

## Context

The platform follows DDD.

The Domain defines abstractions such as Repository interfaces and Domain Service interfaces, while Infrastructure provides concrete implementations.

A consistent dependency injection strategy is required to:

- preserve Dependency Inversion;
- isolate Infrastructure from Domain and Application;
- simplify testing;
- enable implementation replacement without changing business code.

---

## Decision

NestJS Dependency Injection is used as the application's composition mechanism.

Every concrete implementation is wired exactly once inside the Composition Root (NestJS modules).

---

### Dependency Direction

```text
Application
        │
        ▼
Domain Abstractions
        │
        ▼
Dependency Injection
        │
        ▼
Infrastructure Implementations
```

Application and Domain never instantiate Infrastructure directly.

---

### Composition Root

NestJS Modules act as the Composition Root.

Their responsibility is:

- instantiate infrastructure;
- register implementations;
- wire dependencies;
- expose application services.

Modules contain no business logic.

---

### Dependency Injection Rules

Infrastructure implementations are registered against Domain abstractions.

Example:

```text
OptimizationRepository
            │
            ▼
PgOptimizationRepository
```

Application code always depends on:

- Repository interfaces;
- Domain Service interfaces;
- Infrastructure abstractions.

It never depends on concrete implementations.

---

### Provider Registration

Example:

```ts
providers: [
  {
    provide: OptimizationRepository,
    useClass: PgOptimizationRepository,
  },
  {
    provide: AccessManager,
    useClass: CaslAccessManager,
  },
];
```

The provider registration location is the only place where implementation details are selected.

---

### Infrastructure Adapters

External integrations are represented through abstractions.

Examples:

```text
EventBus
        │
        ▼
RabbitMqEventBus
```

Application Layer depends only on these abstractions.

---

### Shared Components

Cross-cutting infrastructure is registered once and reused.

Examples:

- AccessManager;
- EventBus;
- TransactionManager;
- Logger;
- gRPC clients.

Shared infrastructure belongs under:

```text
shared/
    infra/
```

Business abstractions remain inside:

```text
shared/
    domain/
```

Cross-cutting platform capabilities that combine abstractions and implementations are organized as library-like modules. Example:

```text
shared/
    access-control/ (library-like module)
```

---

### Repository Composition

Repository implementations are injected into Application Handlers through Domain interfaces.

```text
Command Handler
        │
        ▼
OptimizationRepository
        │
        ▼
PgOptimizationRepository
        │
        ▼
PostgreSQL
```

Application code never creates repositories.

---

### Testing

Dependency Injection enables implementation replacement.

Examples:

```text
OptimizationRepository
        ├── PgOptimizationRepository
        └── FakeOptimizationRepository
```

```text
AccessManager
        ├── CaslAccessManager
        └── AllowAllAccessManager
```

Component Tests replace Infrastructure through NestJS provider overrides without modifying business code.

---

### Module Boundaries

Every Bounded Context owns its own NestJS Module.

Example:

```text
DecisionIntelligenceModule
    ├── Application Handlers
    ├── Repository Implementations
    ├── Infrastructure Adapters
    └── Provider Registrations
```

Bounded Contexts communicate only through:

- Integration Events;
- gRPC abstractions.

They never inject services directly from another Bounded Context.

---

### Implementation Principles

- One abstraction may have multiple implementations.
- Business code depends only on abstractions.
- Infrastructure implementations are replaceable.
- All wiring is centralized inside NestJS Modules.
- Modules perform composition only and contain no business logic.

---

## Consequences

### Benefits

- Strict Dependency Inversion.
- Infrastructure remains replaceable.
- Business code is framework-independent.
- Testing through provider replacement is straightforward.
- Clear separation between architecture and implementation.

### Trade-offs

- Slightly more indirection compared to direct instantiation.
- Requires disciplined abstraction boundaries.
