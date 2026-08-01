# Decision Intelligence - Optimization Policies

## OptimizationTriggerPolicy

### Purpose

Determines whether changes to a Route require a new Optimization.

### Business Rules

- Creating a Route requires an Optimization.
- Structural Route changes (Shipment assignment, RouteStop changes, RouteStop reordering) require re-optimization.
- Changes that do not affect optimization input do not trigger re-optimization.

---
