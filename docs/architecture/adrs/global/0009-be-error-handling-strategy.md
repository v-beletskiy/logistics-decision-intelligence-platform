# ADR-0009 — Error Handling Strategy

## Context

The platform follows Domain-Driven Design, CQRS, and Event-Driven Architecture.

Failures originate from different architectural layers and require different handling strategies. Treating all failures equally results in incorrect retries, leaking business rules into infrastructure, and inconsistent client behavior.

A consistent error handling strategy is required to:

- clearly distinguish business failures from technical failures;
- provide deterministic API responses;
- support reliable asynchronous processing;
- enable distributed tracing and observability (not in Version 1).

---

## Decision

Errors are categorized by architectural responsibility.

Each layer is responsible only for errors originating within its own boundary.

Errors are propagated upward until translated into transport-specific responses or infrastructure recovery actions.

---

### Error Categories

| Layer          | Responsibility           | Typical Examples                                                        |
| -------------- | ------------------------ | ----------------------------------------------------------------------- |
| Transport      | Invalid requests         | malformed JSON, invalid DTO, missing required field                     |
| Application    | Use case preconditions   | aggregate not found, duplicate request, optimistic concurrency conflict |
| Domain         | Business rule violations | invalid state transition, invariant violation                           |
| Infrastructure | Technical failures       | database unavailable, gRPC timeout, broker unavailable                  |

---

### Error Flow

```text
Business Behavior
        │
        ▼
Domain Exception
        │
        ▼
Application Layer
        │
        ▼
Transport Adapter
        │
        ▼
HTTP / gRPC Response
```

Infrastructure failures follow a different path.

```text
Infrastructure Failure
        │
        ▼
Application Layer
        │
        ▼
Transport Adapter
        │
        ▼
HTTP / gRPC Response
```

No Infrastructure failure is converted into a Domain Exception.

---

### Domain Errors

Aggregates enforce business invariants.

When an invariant is violated, Aggregates throw Domain Exceptions.

Example:

```text
Recommendation

Pending
    │
Accept()
    ▼
Accepted
```

Calling `Accept()` for an already Accepted Recommendation results in:

```text
RecommendationAlreadyAcceptedException
```

Domain Exceptions never contain transport-specific information.

Domain and Application exceptions carry a stable architecture-owned `code`, a
human-readable message, and optional internal context. Internal context is never
serialized automatically. Specific exception types are introduced when a
failure has distinct business meaning or handling; a class per message is not
required.

Semantic base types classify failures without transport knowledge. A
`DomainConflictException` represents a rule failure caused by current aggregate
state; other `DomainException` failures represent invalid business values or
invariants. Transport adapters map those categories and never maintain lists of
bounded-context error codes.

---

### Application Errors

The Application Layer validates use case preconditions before invoking Domain behavior.

Examples:

- Aggregate does not exist.
- Duplicate command.
- Optimistic concurrency conflict.

Application errors represent orchestration failures rather than business rule violations.

`ApplicationException` is an abstract base. Application failures use semantic
subtypes such as `ApplicationInputException`, `ApplicationConflictException`,
and `AggregateNotFoundException`. Concurrency and idempotency conflicts derive
from `ApplicationConflictException`, allowing adapters to translate a stable
category rather than enumerate every concrete exception.

Reusable libraries own their error codes. For example, querying errors derive
from `InvalidQueryError`, while `InvalidPaginationError` and `InvalidSortError`
provide their respective stable codes. Adapters must not invent codes for
errors owned by another layer or package.

---

### Transport Errors

Transport adapters validate incoming requests before constructing application commands.

Examples:

- invalid UUID;
- malformed payload;
- missing required property;
- unsupported enum value.

Transport validation prevents malformed requests from reaching the Application Layer.

Business rules are never implemented here.

---

### Infrastructure Errors

Infrastructure failures represent technical problems outside the business model.

Examples:

- PostgreSQL unavailable;
- gRPC unavailable;
- message broker unavailable;
- network timeout.

Infrastructure errors are never translated into Domain Exceptions.

---

### Exception Translation

Transport adapters translate application exceptions into transport-specific responses.

HTTP failures use RFC 9457 `application/problem+json`. Shape is:

```json
{
  "type": "urn:problem:logistics:driver.already-suspended",
  "title": "Request conflicts with current resource state.",
  "status": 409,
  "instance": "urn:request:01K...",
  "detail": "A driver is already suspended."
}
```

`type` is the stable machine identifier and therefore no duplicate top-level
`code` is emitted. `title` is stable for the problem category and does not vary
between occurrences. `instance` carries the request correlation identifier.
Safe occurrence-specific exception messages are emitted as `detail`; internal
exception context is never serialized automatically. Request schema failures
may additionally contain an `errors` array of safe field issues.

Problem Details exist only in HTTP infrastructure. Domain, Application, and
Infrastructure code never depends on RFC 9457 or HTTP status codes.

Example HTTP mapping:

| Exception                   | HTTP                      |
| --------------------------- | ------------------------- |
| Transport schema failure    | 400 Bad Request           |
| UnauthorizedException       | 401 Unauthorized          |
| ForbiddenException          | 403 Forbidden             |
| AggregateNotFoundException  | 404 Not Found             |
| Application/query input     | 422 Unprocessable Content |
| Invalid business value      | 422 Unprocessable Content |
| Application/domain conflict | 409 Conflict              |
| InfrastructureException     | 500 Internal Server Error |

Unexpected errors return a generic `http.internal-error` problem and are logged
with their request identifier. Stack traces, SQL details, exception class names,
raw validation internals, and secrets are never returned to clients.

Example gRPC mapping:

| Exception                  | gRPC Status         |
| -------------------------- | ------------------- |
| ValidationException        | INVALID_ARGUMENT    |
| UnauthorizedException      | UNAUTHENTICATED     |
| ForbiddenException         | PERMISSION_DENIED   |
| AggregateNotFoundException | NOT_FOUND           |
| DomainException            | FAILED_PRECONDITION |
| InfrastructureException    | UNAVAILABLE         |

---

### Asynchronous Processing

Asynchronous consumers distinguish between business failures and technical failures.

Business failures:

```text
Receive Event
        │
        ▼
Domain Exception
        │
        ▼
Log
        │
        ▼
Acknowledge Message
```

Malformed, schema-invalid, or unsupported integration events are also
deterministic, but are dead-lettered before Inbox processing so operators can
inspect the rejected producer message. They are never retried.

Business errors are deterministic and must not be retried.

Infrastructure failures:

```text
Receive Event
        │
        ▼
Infrastructure Failure
        │
        ▼
Retry
        │
        ▼
Dead Letter Queue (after retry policy)
```

Technical failures may be retried.

---

### Retry Policy

Never retry:

- validation failures;
- authorization failures;
- business rule violations;
- aggregate state conflicts.

Retry:

- database connection failures;
- network failures;
- gRPC failures;
- broker failures;
- transient external service failures.

Retries should use exponential backoff where supported.

---

### Error Handling Principles

- Fail fast.
- Validate as early as possible.
- Business failures are deterministic.
- Technical failures are recoverable where appropriate.
- Infrastructure failures are never represented as Domain Exceptions.
- Authorization follows deny-by-default.

---

## Consequences

### Benefits

- Clear separation of business and technical failures.
- Predictable API behavior.
- Correct retry semantics.
- Improved observability.
- Consistent exception handling across bounded contexts.

### Trade-offs

- Additional exception types.
- Explicit translation layer required.
- More architectural discipline around exception ownership.
