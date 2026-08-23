# Shared Kernel

Reusable Value Objects and domain primitives shared across bounded contexts.

This module contains only generic concepts that have the same meaning throughout the system and do not belong to a specific bounded context.

It is implemented under `apps/core-platform/src/shared/domain` for `core-platform` app. A
bounded-context-level `domain/` is shared only by that context's modules and is
not another Shared Kernel.

## Core - Domain Primitives

The Shared Kernel `core/` provides framework-free base classes for common
Domain mechanics:

- `ValueObject` centralizes equality. Concrete value objects keep their own
  `create` factory, validation, and immutable state, and expose only the
  components that define equality.
- `UuidIdentifier` specializes `ValueObject` for UUID-backed identities. It
  owns UUID validation, immutability, equality, and string representation;
  concrete identifiers keep their typed `generate` and `from` factories.
- `Entity` centralizes identity-based equality. Concrete entities retain their
  `create` and `reconstitute` factories because identity generation and
  restoration are domain-specific.
- `Aggregate` extends `Entity` and centrally buffers domain events through
  `recordDomainEvent` and `pullDomainEvents`. Each aggregate creates its own
  typed event payloads, which preserves its ubiquitous language.

Static factories are deliberately not inherited: a shared static factory would
either bypass domain validation or require a persistence-shaped constructor.

## Validation Helpers

The Core Platform Shared Kernel may contain Domain Exception-aware validation
helpers whose semantics are identical across bounded contexts. These helpers
compose non-throwing primitives from `@logistics-decision-intelligence/validation`
and own the resulting Domain exception and stable error code. They must not
contain bounded-context business rules.

## Schema Representation

A Value Object that participates in an externally-validated transport contract
(such as an HTTP request body) is represented by a corresponding shared JSON
Schema in the Core Platform shared infrastructure, grouped by the same value
category as the domain module (`location/`, `time/`, `measurement/`). Bounded
contexts compose these shared schemas by `$ref`; they do not re-declare shared
value grammar in boundary-local schemas.

## Value Objects

### Location

#### GeoCoordinate

Fields:

- latitude: decimal
- longitude: decimal

Invariants:

- Latitude must be between -90 and 90.
- Longitude must be between -180 and 180.

`GeoCoordinate` identifies a physical point used by the Version 1 distance optimizer. It is distinct from an Address, which is human-readable location information.

---

#### Address

Fields:

- country: string
- stateOrRegion?: string
- city: string
- street: string
- buildingNumber: string
- postalCode: string

Invariants:

- All fields must be provided and non-empty.

---

---

### Time

#### TimeWindow

Fields:

- start: DateTime
- end: DateTime

Invariants:

- Start must not be later than end.

---

#### Schedule

Fields:

- arrivalTime: DateTime
- departureTime: DateTime

Invariants:

- Arrival time must be before departure time.

---

#### Duration

Fields:

- value: int
- unit: enum (hours / minutes / seconds)

Invariants:

- Value must be greater than or equal to zero.

---

---

### Measurement

#### Weight

Fields:

- value: int
- unit: enum (kg / g / lb)

Invariants:

- Value must be greater than or equal to zero.

Behavior:

- Converts its numeric value to any supported Weight unit through `valueIn(...)`.

`Weight` is a runtime class; `WeightUnit` is a runtime enum value set. Class
instances may be checked with `instanceof Weight`; units are checked with
`isEnumValue(WeightUnit, value)`.

---

#### Volume

Fields:

- value: int
- unit: enum (m³ / ft³ / L)

Invariants:

- Value must be greater than or equal to zero.

Behavior:

- Converts its numeric value to any supported Volume unit through `valueIn(...)`.

---

#### Dimensions

Fields:

- length: int
- width: int
- height: int
- unit: enum (m / cm / mm / in)

Invariants:

- Length, Width and Height must be greater than zero.

Behavior:

- Returns its rectangular `Volume` in cubic meters through `volume()`.
- Compares an axis-aligned item against another dimension envelope through `isWithinEnvelope(...)`.

---

#### Distance

Fields:

- value: int
- unit: enum (km / mi)

Invariants:

- Value must be greater than or equal to zero.

Behavior:

- Converts its numeric value to any supported Distance unit through `valueIn(...)`.

---

---
