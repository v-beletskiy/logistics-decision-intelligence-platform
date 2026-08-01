# Shared Kernel

Reusable Value Objects and domain primitives shared across bounded contexts.

This module contains only generic concepts that have the same meaning throughout the system and do not belong to a specific bounded context.

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

---

#### Volume

Fields:

- value: int
- unit: enum (m³ / ft³ / L)

Invariants:

- Value must be greater than or equal to zero.

---

#### Dimensions

Fields:

- length: int
- width: int
- height: int
- unit: enum (cm / mm / in)

Invariants:

- Length, Width and Height must be greater than zero.

---

#### Distance

Fields:

- value: int
- unit: enum (km / mi)

Invariants:

- Value must be greater than or equal to zero.

---

---
