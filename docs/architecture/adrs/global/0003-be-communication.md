# ADR-0003 — Inter-Service & Inter-Bounded Context Communication

## Context

The platform backend consists of:

- **Core Platform** (NestJS), containing multiple Bounded Contexts within a modular monolith.
- **AI Platform** (Python), implemented as an independent service.

The architecture must:

- support strong service contracts and language interoperability;
- preserve loose coupling between Bounded Contexts;
- allow future extraction of Bounded Contexts into independent services without changing business logic.

---

## Decision

## Inter-Service Communication

### Synchronous

The Core Platform and AI Platform communicate synchronously using **gRPC**.

Service contracts are defined using **Protocol Buffers (`.proto`)**.

Protocol Buffers are the single source of truth for inter-service APIs.

Generated client and server stubs are used by both TypeScript and Python services.

---

### Asynchronous

The platform uses a **Distributed Message Broker** for asynchronous service-to-service communication.

Inter-service asynchronous communication follows the **Transactional Outbox** and **Inbox** patterns to ensure reliable event delivery.

Services that publish Integration Events must persist them in a **Transactional Outbox** as part of the same database transaction that modifies business data. After the transaction commits successfully, an **Outbox Publisher** asynchronously delivers pending Integration Events to the Distributed Message Broker.

Services that consume Integration Events must use the **Inbox** pattern to provide idempotent processing and safely handle message delivery.

Example:

```
┌──────────────────────────────────────┐
│            Core Platform             │
└──────────────────────────────────────┘

Application Use Case
        │
        ▼
Business Transaction
        │
        ├── Persist aggregates
        ├── Persist Outbox event
        └── Commit
                 │
                 ▼
          Outbox Publisher
                 │
                 ▼
      Distributed Message Broker
                 │
                 ▼
┌──────────────────────────────────────┐
│             AI Platform              │
└──────────────────────────────────────┘
                 │
                 ├── Persist Inbox record
                 ├── Process recommendationAnalysisRequestedV1
                 ├── Generate analysis
                 ├── Persist recommendationAnalysisCompletedV1
                 │   to Outbox
                 └── Commit
                          │
                          ▼
                   Outbox Publisher
                          │
                          ▼
              Distributed Message Broker
                          │
                          ▼
┌──────────────────────────────────────┐
│            Core Platform             │
└──────────────────────────────────────┘
                 │
                 ├── Persist Inbox record
                 └── Process recommendationAnalysisCompletedV1
```

This approach enables reliable, eventually consistent communication between independently deployed services.

### Which Communication Style to Choose?

**Synchronous communication** is used when the caller requires an immediate response to continue execution.

**Asynchronous communication** is used when the caller only needs to notify another service that a business fact occurred, allowing consumers to react independently.

---

## Inter-Bounded Context Communication

Bounded Contexts expose explicit, producer-owned `public-api/` contracts. A
consumer may depend on those contracts but never on the producer's handlers,
Domain, or Infrastructure.

In-process write notification uses typed internal application events. In-process
reads use narrow query contracts when synchronous data is required. The
consumer maps a provider-neutral contract through a consumer-owned adapter in
its own Infrastructure.

```
Operational Workspace
    public-api/RoutePlanningSnapshotQuery
                    │
                    ▼
Decision Intelligence consumer-owned query adapter
                    │
                    ▼
        RouteOptimizationInputQuery
```

Provider contracts use the provider's language.

Crossing a process or deployment boundary requires a versioned transport
contract. Internal application events and Integration Events intentionally use
different types and delivery guarantees.

---

## Domain Events vs Integration Events

The system distinguishes between **Domain Events** and **Integration Events**.

### Domain Events

Domain Events represent business facts that occurred **inside a single Bounded Context**.

They are raised by aggregates and remain internal to the originating Bounded Context. Every business fact raises a Domain Event.

Examples:

- RecommendationAcceptedDomainEvent
- OptimizationCompletedDomainEvent

### Integration Events

Integration Events represent **stable contracts** published for consumption by other Bounded Contexts or services.

Application use cases translate Domain Events into Integration Events.

An Integration Event is published only when another bounded context or external service requires notification of that business fact.

Integration Events expose only the information required by consumers and never expose internal domain objects or business implementation details.

Internal application events are created with `defineInternalApplicationEvent`.
Their type identifier is stable and unique within the process. Integration
Events are created from a published contract through a producer-scoped event
factory and are persisted directly to the transactional outbox. An intermediate
internal event is not introduced unless multiple in-process consumers need it.

This separation allows the internal domain model to evolve independently from published integration contracts.

#### Integration Event Contract Rules

- Integration Events use structured CloudEvents JSON (`application/cloudevents+json`).
  The shared envelope is a technical interoperability contract, not a Domain model.
- Every payload schema is owned by its producing Bounded Context. Consumers may depend on an immutable published version but never modify it.
- Routing keys and event types include the contract version, for example
  `decision-intelligence.recommendation-analysis-requested.v1`. This permits v1 and v2 consumers to coexist without receiving each other's messages.
- Every wire-shape change, including an optional field, creates a new immutable schema and event version. This preserves closed schemas and avoids silent consumer drift.
- The CloudEvents profile requires `id`, `source`, `type`, `subject`, `time`,
  `dataschema`, `tenantid`, and JSON `data`. `dataschema` makes the payload
  contract explicit; trace context belongs in transport headers. None of this
  metadata is authorization proof.
- `source` identifies the logical producing bounded context using
  `urn:logistics-decision-intelligence:<bounded-context>`. A producer-scoped
  Application event factory injects and validates it; payload schemas and use
  cases do not own it. The factory belongs in the producer's `app/`, not its
  `public-api/`.
- Consumers validate `source` as CloudEvents metadata but do not bind it to an
  event type.
- Contracts are embedded and compiled at process startup. Consumers never fetch
  schemas from a remote registry during message processing.

#### Subscriptions and Delivery Identity

Every inbound subscription declares three independent properties:

```ts
defineSubscription({
  consumerId: "core-platform.decision-intelligence.optimization-executor.v1",
  queue: "core-platform.decision-intelligence.optimization-execution",
  contracts: [optimizationJobEnqueuedV1],
});
```

- `consumerId` is the stable Inbox/idempotency identity;
- `queue` is the broker delivery endpoint;
- `contracts` are the exact immutable event versions accepted.

Contracts alone cannot define consumer identity or topology. Identifiers are
declared once in code, validated by typed helpers, and checked for duplicates at
startup or in tests. A broker subscription implementation is named `Consumer`;
`Worker` is reserved for background-process lifecycle.

#### Outbox Publication

Producers validate the CloudEvent envelope, payload contract, and message size
before writing any item. `IntegrationEventPublisher.publishMany`
delegates to `OutboxStore.enqueueMany`, which performs one atomic PostgreSQL
insert. Validation failure writes nothing; a database failure fails the entire
statement.

Business changes and their outbox records must use the same transaction. Broker
publication occurs later and remains at-least-once, so consumers use Inbox
idempotency. A failed broker confirmation may cause redelivery; it does not make
the business/outbox transaction partial.

---

## Consequences

### Benefits

- Strong service contracts between independently deployed services.
- Loose coupling between Bounded Contexts. Supports eventual extraction of Bounded Contexts into independent services.
- Consistent programming model regardless of deployment topology.
- Suitable for a polyglot architecture.

### Trade-offs

- Additional mapping between Domain Events and Integration Events.
- Additional infrastructure compared to direct application calls.
- Protocol Buffer generation introduces additional tooling.
- Event consumers must be idempotent.
- Cross-context communication is eventually consistent.

---

## Alternatives Considered

### Direct Bounded Context Calls

Rejected because they create coupling between Bounded Contexts and complicate future service extraction.

### Reusing Domain Events as Integration Events

Rejected because published contracts should remain independent from the internal domain model, allowing each Bounded Context to evolve without breaking consumers.

### REST Between Services

Rejected because it introduces multiple sources of truth by requiring DTOs to be maintained independently across services instead of generating them from a shared contract.

### Distributed Message Broker Only

Rejected because synchronous computational interactions requiring an immediate response (e.g. AI inference requests) are better served through gRPC. The platform therefore adopts a hybrid communication model.

---

## Implementation Notes

- The Core Platform owns all operational data.
- The AI Platform accesses operational data exclusively through gRPC APIs.
- The internal RabbitMQ integration topology is a version-controlled, code-owned contract (`IntegrationTopology`).
- RabbitMQ connection management is independent of topology declaration. Publishers and long-lived consumers own separate channels on a shared process connection.
- Shared exchanges are declared by the topology provisioner. Each consumer owns its queue, bindings, retry queue, and dead-letter route.
- Services never share domain models. Protocol Buffers are shared for synchronous
  gRPC APIs; language-neutral JSON Schema contracts are shared for asynchronous
  Integration Events.
- Protocol Buffer definitions are stored in `packages/grpc-contracts`.
  Integration Event schemas are stored in
  `packages/integration-event-contracts`; runtime CloudEvent primitives live in
  `packages/integration-events`.
- Each publishing bounded context owns one Application-layer
  `<bounded-context>-integration-events.ts` factory configured with its stable
  CloudEvent source. It creates events from published contracts; it does not
  define their schemas. The factory is producer-internal Application code, not
  a `public-api/` contract. In-process contracts belong in the bounded context's
  `public-api/`; versioned cross-process schemas belong in
  `packages/integration-event-contracts`.
- JSON Schema is the language-neutral source of truth. Language-specific
  contract payload types are generated from those schemas rather than maintained
  as parallel handwritten definitions.
- Each subscription declares its consumer ID, queue, and exact immutable
  contract versions.
- Inbox idempotency is scoped by a stable, version-controlled logical consumer
  identifier plus the event ID. The logical consumer identifier is independent
  of broker queue names, which may change during topology or deployment changes.
- Each service maps published contracts into its own domain model.
- `InMemoryApplicationEventBus` carries trusted, typed application events between
  Bounded Contexts inside the modular monolith. `IntegrationEventPublisher`
  carries validated CloudEvents toward independently deployed services; they
  intentionally have different message types.
