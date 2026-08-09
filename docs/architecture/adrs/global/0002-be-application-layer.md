# ADR-0002 — Application Layer

## Purpose

The Application Layer coordinates the execution of business use cases.

It orchestrates interactions between the Domain Model and Infrastructure while ensuring that business decisions remain inside the Domain.

The Application Layer owns the execution of business use cases but never owns business rules.

---

## Responsibilities

The Application Layer may:

- validate application-level input;
- load and persist Aggregates through Repository ports;
- invoke Domain Services;
- invoke Shared Domain services and algorithms;
- coordinate Infrastructure through abstractions (e.g. gRPC clients, Event Bus, Transaction Manager);
- define transactional boundaries;
- dispatch Domain Events raised by Aggregates;
- translate Domain Events into Integration Events and dispatch them;
- persist Integration Events to the Transactional Outbox;
- return DTOs.

The Application Layer must not:

- implement business rules;
- directly access the database;
- execute SQL;
- depend on infrastructure implementations like transport frameworks or protocols (HTTP, gRPC, messaging implementations, pure tech algorithms) etc.

---

## Handler Lifecycle

Every Command Handler follows the same execution pipeline.

```text
Receive Command
        │
        ▼
Load Aggregates
        │
        ▼
Execute Aggregate behavior
        │
        ▼
Execute Domain Services (optional)
        │
        ▼
Execute Shared Domain services (optional)
        │
        ▼
Coordinate Infrastructure abstractions (optional)
        │
        ▼
Persist changes
        │
        ▼
Dispatch Domain Events
        │
        ▼
Translate Domain Events
        │
        ▼
Persist Integration Events (Transactional Outbox)
        │
        ▼
Return
```

Outbox is required only for distributed, cross-service events.

---

## Command Handler Rules

- One Handler executes exactly one use case.
- Command Handlers are orchestration layers.
- Business rules belong exclusively to the Domain.
- Aggregates are loaded through Repository ports.
- Command Handlers may invoke Domain Services.
- Command Handlers may coordinate Infrastructure through abstractions only.
- Commands typically return no result. Creation commands may return an identifier.

---

## Query Handler Rules

- Query Handlers never load Aggregates.
- Query Handlers retrieve data through Repository ports or dedicated read models.
- Query Handlers return DTOs.
- Query Handlers never modify state.
- Query Handlers contain no business logic.

---

## Transactions

- Aggregate persistence and Transactional Outbox persistence for Integration Events belong to the same transaction.
- Domain Events are dispatched only after successful persistence.
- Outbox processing and message publication occur asynchronously via a polling worker after the transaction commits successfully. The worker claims and drains bounded batches so it can catch up under load without running indefinitely.

---

## Repository Usage

Repositories may only be accessed from:

- Command Handlers;
- Query Handlers;

Aggregates never access repositories.

The Application Layer depends only on Repository ports defined by the Domain.

---

## Event Handling

Aggregates raise Domain Events while executing business behavior.

After successfully persisting Aggregate changes, the Application Layer dispatches pending Domain Events.

The Application Layer may translate Domain Events into Integration Events.

Integration Events are persisted to the Transactional Outbox.

Example:

```text
Aggregate
      │
      ▼
RecommendationAcceptedDomainEvent
      │
      ▼
Application Layer
      │
      ├── Persist Aggregate
      ├── Dispatch RecommendationAcceptedDomainEvent
      └── Send ApplyRecommendationCommand to Operational Workspace
```

---

## Error Handling

Aggregates throw only Domain Exceptions.

The Application Layer does not handle business errors.

It propagates Domain Exceptions to the transport layer, where they are translated into transport-specific responses (e.g. HTTP or gRPC Status codes).

Infrastructure failures (database, network, external services, etc.) are not converted into Domain Exceptions and are handled independently by Infrastructure or the transport layer.

---

## Error Handling

Application use cases do not recover from business errors.

They propagate Domain Exceptions to the transport layer.

Exception translation is performed by transport adapters.

Infrastructure failures are propagated and handled outside the Domain.

## Dependencies

The Application Layer may depend on:

- Domain Modules;
- Shared Domain;
- Infrastructure abstractions (e.g. gRPC client interfaces, Event Bus interface, Transaction Manager).

The Application Layer must not depend on:

- Repository implementations (SQL, pgTyped generate code);
- Transport implementations (HTTP, gRPC, etc.);
- Message broker implementations (RabbitMQ, etc.).
