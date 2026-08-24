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

| Boundary                        | Primary validation                                     |
| ------------------------------- | ------------------------------------------------------ |
| HTTP, gRPC, integration event   | Versioned transport schema                             |
| App configuration               | Application-owned AJV schema, then role narrowing      |
| Relational persistence          | Mapper read contract, then Domain reconstitution       |
| External provider response      | Compiled envelope schema, then semantic checks         |
| Application use case            | Preconditions and referenced state                     |
| Aggregate, entity, value object | Business invariants during creation and reconstitution |

Runtime checks remain necessary because external, persisted, deserialized, and
JavaScript callers are not protected by TypeScript types.

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

Each schema declares one canonical `$id`; the registry derives its lookup key
from that value rather than accepting a duplicate identifier. Core Platform
HTTP schemas use the stable HTTPS namespace configured by `JSON_SCHEMA_BASE_URI`,
followed by service, transport, resource, operation, and contract version. The
configured namespace must not vary between environments after a contract is
published.

Shared Value Objects that cross an externally-validated transport boundary (for
example, an HTTP request body) are represented by a corresponding shared JSON
Schema in the Core Platform shared infrastructure, mirroring the grammar of the
Domain Value Object they validate. Bounded contexts compose such shared schemas
by `$ref` and must not re-declare a shared concept's grammar in a boundary-local
schema, so a shared concept keeps exactly one versioned wire grammar. The shared
schema remains paired with its Domain Value Object; both are kept in sync within
the same versioned contract.

Every independently registered schema declares the canonical Draft-07 dialect
through `JSON_SCHEMA_DRAFT_07`. Schema authors use the strict `Draft07Schema`
and `IdentifiedSchema` types, which reject unknown standard-keyword spellings at
compile time; Ajv strict mode remains the runtime defense for dynamically loaded
or explicitly cast schemas.

Validators reject unknown properties and never remove fields. Registries are
strict by default. An adapter may opt into schema-declared defaults and Ajv type
coercion when its wire grammar requires it; for example, HTTP query parameters
arrive as strings even when the declared value is an integer. Business
normalization remains in a Domain Value Object when it carries business meaning.

HTTP controllers use the same compile-once Schema Registry and a thin Nest pipe;
the global `class-validator` transformation pipeline is not used. Route
parameters, query objects, request bodies, and authenticated JWT claims are all
treated as untrusted input. Request bodies and claims remain non-coercing.
Query-string primitive coercion is configured only on the query schema registry
and is therefore declarative and local to that adapter. Defaults needed by the
use case are still applied by the Application Layer, because JSON Schema
`default` is an annotation rather than portable mutation behavior.

HTTP request and response DTOs are transport-owned contracts. Controllers map
requests explicitly to Application inputs and map Application results explicitly
to response DTOs. Structural TypeScript compatibility is not used as an
implicit architectural mapping, and Domain objects are never serialized
directly.

For TypeScript HTTP adapters, request, route-parameter, and query DTO types are
derived from their literal JSON Schemas with `FromSchema`. This prevents the
structural static contract from drifting from the runtime validator; it does
not replace Ajv validation. TypeScript cannot represent every runtime predicate
(such as formats and some cross-field rules), so Ajv remains authoritative.
Response DTOs remain explicit TypeScript contracts because responses are mapped
rather than schema-validated.

Transport schemas set bounded string, array, cursor, and pagination sizes to
protect resource usage. Optional means omitted; `null` is rejected unless an
external contract explicitly assigns it meaning. Full replacement operations
use omission as the documented clear operation for optional Driver fields.
Schemas reject empty strings with `minLength`; Domain canonicalization still
rejects values that become blank after trimming.

Opaque cursors are limited to 2,048 base64url characters at both the HTTP and
Application boundaries. This per-field bound complements, but does not replace,
the infrastructure request-target limit.

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

While creating/reconstituting domain aggregate/entity, there should be
validation in place.
String enum values are validated with `isEnumValue(Enum, value)`. `instanceof` is used when a Domain API requires
an already-constructed nominal class such as `Weight`.

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

An Infrastructure client validates its protocol boundary, not invariants already
guaranteed by its typed Application port or provider-owned public contract.
Those invariants are validated by their owner; duplicating them in clients risks
divergent policy and misclassified failures.

Process app configuration is also an Infrastructure boundary. It uses an
application-owned AJV schema for environment shape, coercion, and role-specific
sections. `PROCESS_ROLE` selects exactly one role. After schema validation, a
small assertion such as `assertApiConfigSections(config)` narrows the
discriminated configuration for TypeScript; it does not replace the schema.

Generic parsing belongs in the validation package, e.g. pure `parseUrl`. Configuration maps parser failures to
`AppConfigurationError`.

Inbound integration events validate a shared CloudEvents envelope and the
producer-owned payload schema selected by its versioned event type before inbox
processing. Invalid or unsupported messages are deterministic failures and must
not enter retry processing.

Outbound Integration Events, including their message size, are validated before
entering the outbox. Batch publication validates every item before writing any
item.

External provider responses are untrusted. E.g. OSRM and VROOM responses use a
compiled AJV schema for envelope shape followed by imperative semantic checks
that depend on the request, such as expected matrix dimensions and route/job
sets. Request-specific schemas are compiled statically.

### Validation Primitives

`@logistics-decision-intelligence/validation` is framework- and error-free:

- predicates inspect unknown values and return booleans or type predicates;
- normalizers transform already typed values;
- parsers return a structured success or failure result.

Names state the operation, such as `isPlainObject`, `isEnumValue`, and
`parseUrl`. Domain helpers may compose these primitives and own the resulting
Domain exception and stable code.

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
