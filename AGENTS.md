# AGENTS.md

# Engineering Guidelines

## Purpose

This repository contains a **Logistics Decision Intelligence Platform**.

The platform operates as an intelligent operational layer alongside existing Transportation Management Systems (TMS), Fleet Management Systems, and Telematics platforms. It continuously ingests operational data, enriches it with analytics and AI, generates operational recommendations, and exposes those insights through its own user interface and integration APIs.

The platform consists of multiple independently deployable services organized as bounded contexts following Domain-Driven Design.

This app follows production-grade software engineering best practices, emphasizing maintainability, extensibility, scalability, and explicit architecture.

---

# Repository Structure

The repository follows a monorepo structure.

- **apps/** — deployable applications and services
- **packages/** — reusable shared libraries
- **docs/** — architecture, domain, ADRs and project documentation
- **infrastructure/** — deployment, monitoring and infrastructure-related resources
- **scripts/** — development and automation scripts

## Repository Knowledge Map

Read the following documents before implementing related changes:

- docs/vision.md
- docs/capability-map.md
- docs/architecture/\*
- docs/domain/\*

Architecture Decision Records (ADRs) located at `docs/architecture/adrs/` define implementation conventions and take precedence over assumptions.

## Dependency Rules

Applications are independent deployment units.

Applications **must never import code from another application**.

Applications may communicate only through:

- HTTP / gRPC APIs
- asynchronous messaging
- shared contracts located in `packages/`

Reusable code belongs in `packages/`.

---

# Architecture Principles

The system follows:

- Domain-Driven Design (DDD)
- Clean Architecture
- Hexagonal Architecture

The architecture emphasizes explicit boundaries, high cohesion and low coupling.

## Domain

The Domain Layer:

- contains Aggregates, Entities, Value Objects, Domain Services and Domain Events;
- remains independent of frameworks, databases and transport protocols;
- owns all business decisions and invariants.

Business rules belong exclusively inside the Domain.

---

## Authentication & Authorization

Authentication uses JWT.

Authorization follows a hybrid RBAC + ABAC model.

- Roles grant static permissions.
- Policies evaluate contextual constraints.

Authorization is deny-by-default.

Business authorization decisions are executed through the shared Access Control module.

---

## Dependency Direction

Dependencies must always point toward the domain.

Infrastructure depends on Application.

Application depends on Domain.

Domain depends on nothing outside itself.

---

## Communication

Communication between services should be event-driven whenever appropriate.

Domain Events are preferred over direct coupling.

Avoid synchronous dependencies unless there is a clear business justification.

---

## Error Handling

Different architectural layers own different failures.

- Transport validates request format.
- Application validates use-case preconditions.
- Domain validates business rules.
- Infrastructure handles technical failures.

Never convert Infrastructure failures into Domain Exceptions.

Business failures must not be retried.

Transient Infrastructure failures may be retried.

---

## Testing

Prefer:

- Unit Tests for Domain logic
- Component Tests for Application use cases
- E2E Tests for critical user flows (planned)
- Load Tests for performance-sensitive components (planned)

Tests should accompany implementation.

---

## Shared Code

Only generic, reusable functionality that is independent of any application or bounded context belongs in `packages/`.

Do not move code into shared libraries prematurely.

Prefer duplication over incorrect abstractions.

---

# Development Workflow

Before implementing a feature:

1. Understand the relevant documentation.
2. Identify affected bounded contexts.
3. Reuse existing architectural patterns whenever possible.
4. Prefer incremental implementation over large changes.

Large architectural changes require explicit approval.

---

# Coding Principles

Prefer:

- rich domain models
- value objects
- aggregates
- domain events
- factories
- specifications when appropriate
- immutable domain objects where practical
- explicit interfaces
- composition over inheritance

Avoid:

- business logic inside controllers
- framework-specific code inside the domain
- leaking DTOs into the domain
- circular dependencies
- hidden side effects
- large "god" services
- premature abstractions

Code should prioritize readability over cleverness.

---

# Testing

Every feature should include appropriate automated tests.

Prefer:

- unit tests for domain logic
- integration tests for infrastructure
- end-to-end tests for critical user flows
- load tests for performance-sensitive components

Tests should accompany implementation.

---

# Observability

Production-oriented code should include:

- structured logging
- correlation / request identifiers
- meaningful error handling
- metrics where appropriate

Avoid silent failures.

---

# Security

Never:

- commit secrets
- hardcode credentials
- bypass authentication or authorization
- trust external input

Always validate external data.

Follow the principle of least privilege.

---

## Implementation Scope

Keep implementation minimal.

Implement only the requested feature.

Avoid unrelated refactoring.

Avoid introducing new abstractions unless explicitly required by existing ADRs.

When documentation is insufficient, stop and ask for clarification rather than making architectural decisions.

---

# Definition of Done

A task is complete when:

- implementation is finished
- automated tests pass
- linting passes
- architectural boundaries remain respected
- no unnecessary technical debt is introduced

---
