# ADR-0008 — Testing Strategy

## Purpose

The testing strategy prioritizes verification of business behavior while keeping Version 1 lean.

The platform focuses on testing the Domain Model and Application use cases. Broader system verification will be introduced incrementally as the product evolves.

---

## Testing Pyramid

```text
  End-to-End Tests
(Phase 2+ / postponed)

         ▲

    Component Tests
(Application Use Cases)

         ▲

    Unit Tests
    (Domain Model)
```

---

## Unit Tests

Unit Tests verify the Domain Model in complete isolation.

Covered components:

- Aggregates;
- Value Objects;
- Domain Services;
- Domain Policies.

Unit Tests:

- contain no mocks;
- contain no infrastructure;
- verify business rules, invariants, and Domain Events.

Example:

```text
Recommendation.accept()

↓

status becomes Accepted

↓

RecommendationAcceptedDomainEvent raised
```

---

## Component Tests

Component Tests verify individual Application use cases.

Covered components:

- Command Handlers;
- Query Handlers.

Dependencies such as repositories, transaction manager, event bus, gRPC clients, and other infrastructure abstractions are mocked.

Component Tests verify:

- orchestration;
- transaction boundaries;
- repository interactions;
- Domain Event dispatching;
- Integration Event creation and persistence to the Transactional Outbox.

Business rules themselves are not re-tested here—they are covered by Domain Unit Tests.

---

## E2E Tests

E2E Tests verify complete business workflows across the running system.

Typical scenarios include:

- Route creation → Optimization → Recommendation generation;
- Recommendation acceptance → Operational Workspace update;
- Recommendation analysis request → AI Platform → Analysis attached.

To keep Version 1 implementation lean, E2E Tests are intentionally postponed.

They will be introduced incrementally as the platform evolves and especially when cross-service workflows become more complex.

---

## Principles

- Business logic is tested primarily through Domain Unit Tests.
- Application orchestration is verified through Component Tests.
- Infrastructure is mocked in Component Tests.
- E2E Tests are added only where they provide meaningful business value.
