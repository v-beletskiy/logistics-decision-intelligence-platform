# ADR-0007 — Validation Strategy

## Purpose

Validation ensures that data entering the system is complete, well-formed, and consistent before business behavior is executed.

Validation is performed at multiple architectural layers, with each layer responsible only for the rules within its boundary.

---

## Decision

### Validation Responsibilities

#### Transport Validation

Transport adapters validate incoming requests before constructing application commands.

Examples:

- required fields;
- data types;
- string length;
- enum values.

Transport validation prevents malformed requests from reaching the Application Layer.

Business rules must never be implemented here.

---

#### Application Validation

The Application Layer validates use case preconditions before invoking the Domain.

Examples:

- referenced entities exist;
- command parameters are internally consistent;
- optimistic concurrency checks.

Application validation coordinates the execution of the use case but never makes business decisions.

---

#### Domain Validation

The Domain validates business invariants.

Examples:

- Route must contain at least one Stop.
- Recommendation can only be accepted while Pending.
- Vehicle capacity cannot become negative.

Business rules are always enforced by the Domain, regardless of the caller.

---

### Validation Flow

```text
HTTP / gRPC / Message
        │
        ▼
Transport Validation
        │
        ▼
Application Validation
        │
        ▼
Domain Validation
        │
        ▼
Business Behavior
```

---

### Validation Rules

- Validation is performed as early as possible.
- Every layer validates only rules belonging to its responsibility.
- Business invariants are enforced exclusively by the Domain.
- Application Layer never duplicates Domain validation.
- Transport adapters never implement business rules.

---

### Error Handling

Each validation layer returns errors appropriate to its responsibility.

| Layer       | Error Type                          |
| ----------- | ----------------------------------- |
| Transport   | Invalid request / malformed payload |
| Application | Use case precondition failed        |
| Domain      | Business rule violation             |

---

## Consequences

### Benefits

- Clear separation of responsibilities.
- No duplicated business rules.
- Consistent enforcement of domain invariants.
- Easier testing through isolated validation responsibilities.

### Trade-offs

- Some validation logic exists at multiple layers, but each layer validates different concerns.
- Proper boundary discipline is required to prevent business rules from leaking outside the Domain.
