# Operational Workspace - Application Use Cases

# Shipment

---

## Commands

### Create Shipment

#### Purpose

Create a new transportation request representing the movement of goods from an origin location to a destination location.

#### Command

- CreateShipmentCommand

#### Handler

- CreateShipmentHandler

#### Triggers

- REST API

#### Flow

1. Validate shipment creation request.
2. Validate pickup endpoint data.
3. Validate delivery endpoint data.
4. Create Shipment aggregate.
5. Persist Shipment via ShipmentRepository.save().
6. Publish ShipmentCreatedDomainEvent event.

---

### Update Shipment Details

#### Purpose

Update shipment information before execution.

#### Command

- UpdateShipmentDetailsCommand

#### Handler

- UpdateShipmentDetailsHandler

#### Triggers

- REST API

#### Flow

1. Load Shipment via ShipmentRepository.findById().
2. Execute Shipment.updateDetails(...).
3. Persist Shipment via ShipmentRepository.save().
4. Publish ShipmentDetailsUpdatedDomainEvent event.

---

### Cancel Shipment

#### Purpose

Cancel a shipment that will no longer be executed.

#### Command

- CancelShipmentCommand

#### Handler

- CancelShipmentHandler

#### Triggers

- REST API

#### Flow

1. Load Shipment via ShipmentRepository.findById().
2. Execute Shipment.cancel().
3. Persist Shipment via ShipmentRepository.save().
4. Publish ShipmentCancelledDomainEvent event.

---

### Complete Pickup

#### Purpose

Mark shipment pickup operation as completed.

#### Command

- CompletePickupCommand

#### Handler

- CompletePickupHandler

#### Triggers

- REST API

#### Flow

1. Load Shipment via ShipmentRepository.findById().
2. Execute Shipment.completePickup().
3. Persist Shipment via ShipmentRepository.save().
4. Publish PickupCompletedDomainEvent event.

---

### Complete Delivery

#### Purpose

Mark shipment delivery operation as completed.

#### Command

- CompleteDeliveryCommand

#### Handler

- CompleteDeliveryHandler

#### Triggers

- REST API

#### Flow

1. Load Shipment via ShipmentRepository.findById().
2. Execute Shipment.completeDelivery().
3. Persist Shipment via ShipmentRepository.save().
4. Publish DeliveryCompletedDomainEvent event.

---

# Route

---

## Commands

### Create Route

#### Purpose

Create an operational Route containing ordered execution stops for one or more Shipments.

#### Command

- CreateRouteCommand

#### Handler

- CreateRouteHandler

#### Triggers

- REST API

#### Flow

1. Load Shipments via ShipmentRepository.findByIds().
2. Create Route aggregate.
3. Create RouteStop entities for shipment Pickup and Delivery operations.
4. Persist Route via RouteRepository.save().
5. Publish RouteCreatedDomainEvent.
6. Publish RouteCreatedIntegrationEvent.

---

### Reorder Route Stops

#### Purpose

Change the execution order of RouteStops before Route execution starts.

#### Command

- ReorderRouteStopsCommand

#### Handler

- ReorderRouteStopsHandler

#### Triggers

- REST API

#### Flow

1. Load Route via RouteRepository.findById().
2. Execute Route.reorderStops(...).
3. Persist Route via RouteRepository.save().
4. Publish RouteStopsReorderedDomainEvent event.
5. Publish RouteStructureChangedIntegrationEvent event.

---

### Start Route

#### Purpose

Start execution of an assigned Route.

#### Command

- StartRouteCommand

#### Handler

- StartRouteHandler

#### Triggers

- REST API

#### Flow

1. Load Route via RouteRepository.findById().
2. Load Assignment via AssignmentRepository.findRunningByRouteId().
3. Execute Route.start().
4. Persist Route via RouteRepository.save().
5. Publish RouteStartedDomainEvent event.

---

### Complete Route

#### Purpose

Complete Route execution after all required RouteStops have been completed.

#### Command

- CompleteRouteCommand

#### Handler

- CompleteRouteHandler

#### Triggers

- REST API

#### Flow

1. Load Route via RouteRepository.findById().
2. Execute Route.complete().
3. Persist Route via RouteRepository.save().
4. Publish RouteCompletedDomainEvent event.

---

# Assignment

---

## Commands

### Create Assignment

#### Purpose

Allocate a Vehicle and Driver to execute a Route.

#### Command

- CreateAssignmentCommand

#### Handler

- CreateAssignmentHandler

#### Triggers

- REST API

#### Flow

1. Load Route via RouteRepository.findById().
2. Load Vehicle via VehicleRepository.findById().
3. Load Driver via DriverRepository.findById().
4. Load Shipments executed by the Route via ShipmentRepository.findByRouteId().
5. Execute AssignmentPlanningService.plan(route, vehicle, driver, shipments).
6. Persist Assignment via AssignmentRepository.save().
7. Publish AssignmentCreatedDomainEvent event.
8. Publish RouteStructureChangedIntegrationEvent.

---

### Reassign Vehicle

#### Purpose

Replace the Vehicle assigned to a Route execution.

#### Command

- ReassignVehicleCommand

#### Handler

- ReassignVehicleHandler

#### Triggers

- REST API

#### Flow

1. Load Assignment via AssignmentRepository.findById().
2. Load Vehicle via VehicleRepository.findById().
3. Execute AssignmentPlanningService.validateVehicle(...).
4. Execute Assignment.reassignVehicle(...).
5. Persist Assignment via AssignmentRepository.save().
6. Publish VehicleReassignedDomainEvent event.
7. Publish RouteStructureChangedIntegrationEvent.

---

### Reassign Driver

#### Purpose

Replace the Driver assigned to a Route execution.

#### Command

- ReassignDriverCommand

#### Handler

- ReassignDriverHandler

#### Triggers

- REST API

#### Flow

1. Load Assignment via AssignmentRepository.findById().
2. Load Driver via DriverRepository.findById().
3. Execute AssignmentPlanningService.validateDriver(...).
4. Execute Assignment.reassignDriver(...).
5. Persist Assignment via AssignmentRepository.save().
6. Publish DriverReassignedDomainEvent event.
7. Publish RouteStructureChangedIntegrationEvent.

---

### Start Assignment

#### Purpose

Start Assignment execution.

#### Command

- StartAssignmentCommand

#### Handler

- StartAssignmentHandler

#### Triggers

- REST API

#### Flow

1. Load Assignment via AssignmentRepository.findById().
2. Execute Assignment.start().
3. Persist Assignment via AssignmentRepository.save().
4. Publish AssignmentStartedDomainEvent event.

---

### Complete Assignment

#### Purpose

Mark Assignment execution as completed.

#### Command

- CompleteAssignmentCommand

#### Handler

- CompleteAssignmentHandler

#### Triggers

- REST API

#### Flow

1. Load Assignment via AssignmentRepository.findById().
2. Execute Assignment.complete().
3. Persist Assignment via AssignmentRepository.save().
4. Publish AssignmentCompletedDomainEvent event.

---

### Cancel Assignment

#### Purpose

Cancel an Assignment that will no longer be executed.

#### Command

- CancelAssignmentCommand

#### Handler

- CancelAssignmentHandler

#### Triggers

- REST API

#### Flow

1. Load Assignment via AssignmentRepository.findById().
2. Execute Assignment.cancel().
3. Persist Assignment via AssignmentRepository.save().
4. Publish AssignmentCancelledDomainEvent event.
5. Publish RouteStructureChangedIntegrationEvent.

---

# Vehicle

---

## Commands

### Register Vehicle

#### Purpose

Register a new Vehicle available for transportation operations.

#### Command

- RegisterVehicleCommand

#### Handler

- RegisterVehicleHandler

#### Triggers

- REST API

#### Flow

1. Validate vehicle registration data.
2. Create Vehicle aggregate.
3. Persist Vehicle via VehicleRepository.save().
4. Publish VehicleRegisteredDomainEvent event.

---

### Update Vehicle Details

#### Purpose

Update Vehicle information and configuration.

#### Command

- UpdateVehicleDetailsCommand

#### Handler

- UpdateVehicleDetailsHandler

#### Triggers

- REST API

#### Flow

1. Load Vehicle via VehicleRepository.findById().
2. Execute Vehicle.updateDetails(...).
3. Persist Vehicle via VehicleRepository.save().
4. Publish VehicleDetailsUpdatedDomainEvent event.

---

### Change Vehicle Availability

#### Purpose

Change Vehicle operational availability status.

#### Command

- ChangeVehicleAvailabilityCommand

#### Handler

- ChangeVehicleAvailabilityHandler

#### Triggers

- REST API

#### Flow

1. Load Vehicle via VehicleRepository.findById().
2. Execute Vehicle.updateAvailability(...).
3. Persist Vehicle via VehicleRepository.save().
4. Publish corresponding Vehicle status event.

---

### Decommission Vehicle

#### Purpose

Remove a Vehicle from active operational use.

#### Command

- DecommissionVehicleCommand

#### Handler

- DecommissionVehicleHandler

#### Triggers

- REST API

#### Flow

1. Load Vehicle via VehicleRepository.findById().
2. Execute Vehicle.decommission().
3. Persist Vehicle via VehicleRepository.save().
4. Publish VehicleDecommissionedDomainEvent event.

---

# Driver

---

## Commands

### Register Driver

#### Purpose

Register a new Driver who can participate in transportation operations.

#### Command

- RegisterDriverCommand

#### Handler

- RegisterDriverHandler

#### Triggers

- REST API

#### Flow

1. Validate driver registration data.
2. Create Driver aggregate.
3. Persist Driver via DriverRepository.save().
4. Publish DriverRegisteredDomainEvent event.

---

### Update Driver Details

#### Purpose

Update Driver information.

#### Command

- UpdateDriverDetailsCommand

#### Handler

- UpdateDriverDetailsHandler

#### Triggers

- REST API

#### Flow

1. Load Driver via DriverRepository.findById().
2. Execute Driver.updateDetails(...).
3. Persist Driver via DriverRepository.save().
4. Publish DriverDetailsUpdatedDomainEvent event.

---

### Change Driver Availability

#### Purpose

Change Driver operational availability status.

#### Command

- ChangeDriverAvailabilityCommand

#### Handler

- ChangeDriverAvailabilityHandler

#### Triggers

- REST API

#### Flow

1. Load Driver via DriverRepository.findById().
2. Execute Driver.updateAvailability(...).
3. Persist Driver via DriverRepository.save().
4. Publish corresponding Driver status event.

---

### Suspend Driver

#### Purpose

Temporarily prevent a Driver from participating in Assignments.

#### Command

- SuspendDriverCommand

#### Handler

- SuspendDriverHandler

#### Triggers

- REST API

#### Flow

1. Load Driver via DriverRepository.findById().
2. Execute Driver.suspend().
3. Persist Driver via DriverRepository.save().
4. Publish DriverSuspendedDomainEvent event.

---

### Reinstate Driver

#### Purpose

Restore Driver availability after suspension.

#### Command

- ReinstateDriverCommand

#### Handler

- ReinstateDriverHandler

#### Triggers

- REST API

#### Flow

1. Load Driver via DriverRepository.findById().
2. Execute Driver.reinstate().
3. Persist Driver via DriverRepository.save().
4. Publish DriverReinstatedDomainEvent event.
