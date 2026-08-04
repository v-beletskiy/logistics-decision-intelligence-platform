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
                 ├── Process RecommendationAnalysisRequestedIntegrationEvent
                 ├── Generate analysis
                 ├── Persist RecommendationAnalysisCompletedIntegrationEvent
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
                 └── Process RecommendationAnalysisCompletedIntegrationEvent
```

This approach enables reliable, eventually consistent communication between independently deployed services.

### Which Communication Style to Choose?

**Synchronous communication** is used when the caller requires an immediate response to continue execution.

**Asynchronous communication** is used when the caller only needs to notify another service that a business fact occurred, allowing consumers to react independently.

---

## Inter-Bounded Context Communication

Bounded Contexts communicate exclusively through **Integration Events** delivered via an **Application Event Bus**.

Direct dependencies between Bounded Contexts are prohibited.

```
Operational Workspace
        │
        │ RouteCreatedIntegrationEvent
        ▼
Application Event Bus
        │
        ▼
Decision Intelligence
```

The **Application Event Bus** is an abstraction over event delivery.

Version 1 provides:

- an **InMemoryApplicationEventBus** implementation for write communication between Bounded Contexts inside the modular monolith;
- a **read-contract** for read communication between Bounded Contexts inside the modular monolith;
- a **DistributedApplicationEventBus** implementation for communication between independently deployed services through the Distributed Message Broker.

This provides a consistent programming model regardless of deployment topology.

Communication between Bounded Contexts inside the modular monolith does not use the Outbox or Inbox patterns. If a Bounded Context is later extracted into an independent service, the same Application Event Bus abstraction can be backed by a distributed implementation using the Outbox and Inbox patterns without changing application or domain logic. While read-contract models get substituted with sync calls.

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

```
Aggregate
      │
      ▼
Domain Event
      │
      ▼
Application Use Case
      │
      ├── Persist business transaction
      │
      └── Map Domain Event
              │
              ▼
      Integration Event
              │
              ├──────────────────────────────┐
              │                              │
              ▼                              ▼
 InMemoryApplicationEventBus         Transactional Outbox
 (same service)                              │
              │                              ▼
              ▼                      Outbox Publisher
 Another Bounded Context                     │
 (same service)                              ▼
                                   Distributed Message Broker
                                             │
                                             ▼
                                      Another Service
```

This separation allows the internal domain model to evolve independently from published integration contracts.

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
- Services never share domain models. Only generated Protocol Buffer contracts are shared between services.
- Protocol Buffer definitions are stored in `packages/grpc-contracts`.
- Each service maps published contracts into its own domain model.
- The Application Event Bus is an abstraction. Both implementations expose the same programming interface to application use cases.
  - `InMemoryApplicationEventBus` is used for communication between Bounded Contexts inside the modular monolith.
  - `DistributedApplicationEventBus` is used for communication between independently deployed services.
