# ADR-0007 — Validation Strategy

## Purpose

Validation ensures that data entering the system is complete, well-formed, and consistent before business behavior is executed.

Validation is performed at multiple architectural layers. Each layer owns its
response to invalid data at its boundary, while the same input may be checked
again when it crosses a different boundary or is needed to protect a Domain
invariant.

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
It is a fail-fast user experience concern, not the sole protection of the
Domain.

Business rules must never be implemented here.

For example, an HTTP DTO may reject malformed email syntax before a command is
created. It must not decide whether a business-restricted email domain is
allowed.

JSON transport boundaries use trusted, application-owned JSON Schemas compiled
once through the `@logistics-decision-intelligence/validation/json-schema`
package entry point. This entry point is technical infrastructure - Domain and
Application layers never depend on it.

Validators reject unknown properties and do not implicitly coerce types, insert
defaults, or remove fields. Any normalization must be explicit in the adapter
or in a Domain Value Object with business meaning.

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
- A domain object cannot hold an unsupported status or classification.

Business rules are always enforced by the Domain, regardless of the caller.

Value Objects and aggregate construction validate the state they own. This may
intentionally overlap with transport validation: the transport layer fails
fast for a malformed email, while an Email Value Object applies the Domain's
complete semantics, such as canonicalization and permitted-domain policy.

#### Infrastructure Validation

Infrastructure validates technical constraints at integration boundaries and
protects persistence and external-system integrity.

Examples:

- database constraints, foreign keys, and uniqueness enforcement;
- serialization compatibility;
- external provider payload limits, authentication requirements, and protocol constraints.

Infrastructure validation never decides a business policy and never converts a
technical failure into a Domain Exception. It returns or translates failures as
technical/infrastructure errors.

Inbound integration events validate a shared CloudEvents envelope and the
producer-owned payload schema selected by its versioned event type before inbox
processing. Invalid or unsupported messages are deterministic failures and must
not enter retry processing.

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
Business Behavior and Persistence / External Calls
        │
        ▼
Infrastructure Validation
```

---

### Error Handling

Each validation layer returns errors appropriate to its responsibility.

| Layer          | Error Type                          |
| -------------- | ----------------------------------- |
| Transport      | Invalid request / malformed payload |
| Application    | Use case precondition failed        |
| Domain         | Business rule violation             |
| Infrastructure | Technical / integration failure     |

---

## Consequences

### Benefits

- Clear separation of responsibilities.
- No duplicated business rules.
- Consistent enforcement of domain invariants.
- Easier testing through isolated validation responsibilities.

### Trade-offs

- Some checks intentionally occur at multiple layers, but each occurrence has a distinct boundary responsibility.
- Proper boundary discipline is required to prevent business rules from leaking outside the Domain.
- A JSON Schema may be reused only when the same versioned external contract is
  consumed at multiple boundaries. Transport schemas are not reused as Domain
  validation rules.

## Reference

- [Domain-Driven Design: A Comprehensive Guide to Validation Across Layers](https://medium.com/@serhatalftkn/domain-driven-design-a-comprehensive-guide-to-validation-across-layers-8955d6854e7d)
