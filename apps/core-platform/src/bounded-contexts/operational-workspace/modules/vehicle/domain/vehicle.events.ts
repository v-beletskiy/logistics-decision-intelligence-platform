import type { DomainEvent } from "../../../../../shared/domain/domain-event.js";

export interface VehicleDomainEvent extends DomainEvent {}

export interface VehicleRegisteredDomainEvent extends VehicleDomainEvent {
  readonly type: "VehicleRegisteredDomainEvent";
}
export interface VehicleDetailsUpdatedDomainEvent extends VehicleDomainEvent {
  readonly type: "VehicleDetailsUpdatedDomainEvent";
}
export interface VehicleCompartmentAddedDomainEvent extends VehicleDomainEvent {
  readonly type: "VehicleCompartmentAddedDomainEvent";
  readonly compartmentId: string;
}
export interface VehicleCompartmentUpdatedDomainEvent extends VehicleDomainEvent {
  readonly type: "VehicleCompartmentUpdatedDomainEvent";
  readonly compartmentId: string;
}
export interface VehicleCompartmentRemovedDomainEvent extends VehicleDomainEvent {
  readonly type: "VehicleCompartmentRemovedDomainEvent";
  readonly compartmentId: string;
}
export interface VehicleMarkedAvailableDomainEvent extends VehicleDomainEvent {
  readonly type: "VehicleMarkedAvailableDomainEvent";
}
export interface VehicleMarkedUnavailableDomainEvent extends VehicleDomainEvent {
  readonly type: "VehicleMarkedUnavailableDomainEvent";
}
export interface VehicleSentToMaintenanceDomainEvent extends VehicleDomainEvent {
  readonly type: "VehicleSentToMaintenanceDomainEvent";
}
export interface VehicleReturnedFromMaintenanceDomainEvent extends VehicleDomainEvent {
  readonly type: "VehicleReturnedFromMaintenanceDomainEvent";
}
export interface VehicleDecommissionedDomainEvent extends VehicleDomainEvent {
  readonly type: "VehicleDecommissionedDomainEvent";
}

export type VehicleEvent =
  | VehicleRegisteredDomainEvent
  | VehicleDetailsUpdatedDomainEvent
  | VehicleCompartmentAddedDomainEvent
  | VehicleCompartmentUpdatedDomainEvent
  | VehicleCompartmentRemovedDomainEvent
  | VehicleMarkedAvailableDomainEvent
  | VehicleMarkedUnavailableDomainEvent
  | VehicleSentToMaintenanceDomainEvent
  | VehicleReturnedFromMaintenanceDomainEvent
  | VehicleDecommissionedDomainEvent;
