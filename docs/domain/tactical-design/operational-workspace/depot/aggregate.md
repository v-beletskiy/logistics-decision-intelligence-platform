# Depot Aggregate

Represents a physical operational location where Vehicles and Drivers are based.

## Invariants

- A Depot has a non-empty name.
- A Depot has exactly one Address.
- An Active Depot cannot receive new Vehicles if its Vehicle capacity is reached.
- An Active Depot cannot receive new Drivers if its Driver capacity is reached.
- An Inactive/Closed Depot cannot receive new Vehicles or Drivers.

## Domain Events

- DepotCreatedDomainEvent
- DepotDetailsUpdatedDomainEvent
- DepotVehicleCapacityUpdatedDomainEvent
- DepotDriverCapacityUpdatedDomainEvent
- DepotActivatedDomainEvent
- DepotInactivatedDomainEvent
- DepotClosedDomainEvent

## Value Objects

- Address (shared kernel VO)

## Enums

- DepotStatus
  - Active
  - Inactive
  - Closed

## Repository Interfaces

- DepotRepository
  - `findById`, `find`
  - `add`, `save`

---
