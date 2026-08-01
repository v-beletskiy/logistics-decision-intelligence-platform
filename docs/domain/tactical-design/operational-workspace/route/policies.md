# Operational Workspace - Route Policies

## RoutePlanningPolicy

### Purpose

Determines whether a Route may be modified based on its current operational state.

### Business Rules

- A Route with an active Assignment cannot have RouteStops added, removed, or reordered.
- A Route that has already started cannot have RouteStops added, removed, or reordered.
- A completed or cancelled Route cannot be modified.
- Cannot reorder RouteStops if an active Assignment exists.

---
