# ADR-0005 — Dependency Injection & Module Composition

## Context

The platform follows DDD.

The Domain defines abstractions such as Repository ports and Domain Service contracts, while Infrastructure provides concrete implementations.

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

Each runtime process has its own root under `src/composition/`:

- API composition wires stuff like HTTP, gRPC, authentication, outbound messaging,
  and in-process application-event subscriptions;
- Worker composition wires stuff like consumers, schedulers, and their required adapters;
- CLI composition wires stuff like requested administration workflow.

The `PROCESS_ROLE` configuration selects one role (`api` or `worker`). A process
does not instantiate transports or consumers owned only by another role.

Feature-specific Nest wiring belongs in that feature's `composition/` folder.
Those modules may import both Application handlers and Infrastructure adapters;
they are composition code, not Application-layer code.

Module placement follows what is being composed:

| Module responsibility                                                    | Location                    |
| ------------------------------------------------------------------------ | --------------------------- |
| Process or bounded-context assembly                                      | `composition/`              |
| Feature wiring that combines handlers, policies, and adapters            | feature `composition/`      |
| Packaging providers owned by one adapter, such as PostgreSQL persistence | owning `infra/<adapter>/`   |
| Transport entry points, such as gRPC controllers                         | owning `infra/<transport>/` |

`app/` and `domain/` do not own Nest modules. A module under `infra/` must remain
adapter-focused; once it selects providers across layers or transports, it is
feature composition and moves to `composition/`. Avoid one-provider adapter
modules unless that provider set has an independent reuse or lifecycle boundary.

Feature composition follows the CQRS split consistently. Implemented command
handlers belong to `<Feature>CommandModule`; implemented query handlers belong
to `<Feature>QueryModule`. A feature with both always defines both modules,
regardless of whether they are currently composed by the same runtime. Do not
create an empty command or query module when that side has no implemented
handlers.

Name feature composition by its responsibility: a standard handler slice uses
`CommandModule` or `QueryModule`; a workflow-specific slice uses its workflow
name, such as `OptimizationTriggerModule` or
`OptimizationWorkerModule`. Bounded-context composition is named for
its boundary or process role (`ApiModule`, `WorkerModule`, `PublicApiModule`) and
imports feature modules directly. Do not add bounded-context `CommandModule` or
`QueryModule` pass-through modules that only re-export feature modules.

When an API process subscribes to in-process application events, the bounded
context owns a `<BoundedContext>ApplicationEventsModule` in `composition/`. It
registers the event handlers and imports their feature workflow modules. This
is an inbound application-event boundary, not a feature `CommandModule` or an
Infrastructure transport module.

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

- Repository ports;
- Domain Service contracts;
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

`Factory` and `Provider` are semantic names, not required suffixes for DI
classes. A factory constructs clients or objects; a provider obtains a value or
capability. For example, `GrpcClientFactory` remains appropriate because client
construction owns connection and authentication configuration.

### Injection Tokens

Use the constructor parameter type as the injection token whenever that type exists at runtime:

| Dependency contract                       | Injection convention         |
| ----------------------------------------- | ---------------------------- |
| Concrete class                            | Constructor type only        |
| Abstract-class port                       | Constructor type only        |
| Interface with a `Symbol` or string token | `@Inject(TOKEN)` is required |
| Deliberately aliased token                | `@Inject(TOKEN)` is required |

Repository ports in this codebase are abstract classes. They are intentionally framework-independent runtime contracts and may be used directly as provider tokens. Do not add `@Inject(RepositoryPort)` when it duplicates the constructor parameter type.

`@Inject()` is reserved for a token that cannot be inferred from the parameter type, such as configuration represented by a TypeScript interface and registered under a `Symbol`.

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

Every Bounded Context owns its own NestJS composition. Cross-module or public-API
wiring uses a bounded-context `composition/` module; transport modules remain
under their owning bounded context or domain module.

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
- typed internal application events;
- bounded-context public query contracts;
- external HTTP or gRPC contracts when deployed separately.

They never inject or import another context's internal handlers. A provider's
public query contract is implemented by provider-owned composition and consumed
through a consumer-owned adapter.

---

### Implementation Principles

- One abstraction may have multiple implementations.
- Business code depends only on abstractions.
- Infrastructure implementations are replaceable.
- All wiring is centralized inside NestJS Modules.
- Modules perform composition only and contain no business logic.
- Only implemented handlers and adapters are registered.

---

## Consequences

### Benefits

- Strict Dependency Inversion.
- Infrastructure remains replaceable.
- Domain code is framework-independent. Application code may use NestJS metadata decorators solely for composition and authorization; it must not depend on transport or infrastructure implementations.
- Testing through provider replacement is straightforward.
- Clear separation between architecture and implementation.

### Trade-offs

- Slightly more indirection compared to direct instantiation.
- Requires disciplined abstraction boundaries.
