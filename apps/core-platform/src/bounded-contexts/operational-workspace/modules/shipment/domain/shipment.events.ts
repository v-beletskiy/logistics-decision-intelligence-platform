import type { DomainEvent } from "../../../../../shared/domain/domain-event.js";

export interface ShipmentDomainEvent extends DomainEvent {}

export interface ShipmentCreatedDomainEvent extends ShipmentDomainEvent {
  readonly type: "ShipmentCreatedDomainEvent";
}
export interface ShipmentDetailsUpdatedDomainEvent extends ShipmentDomainEvent {
  readonly type: "ShipmentDetailsUpdatedDomainEvent";
}
export interface ShipmentCancelledDomainEvent extends ShipmentDomainEvent {
  readonly type: "ShipmentCancelledDomainEvent";
}
export interface PickupCompletedDomainEvent extends ShipmentDomainEvent {
  readonly type: "PickupCompletedDomainEvent";
}
export interface DeliveryCompletedDomainEvent extends ShipmentDomainEvent {
  readonly type: "DeliveryCompletedDomainEvent";
}

export type ShipmentEvent =
  | ShipmentCreatedDomainEvent
  | ShipmentDetailsUpdatedDomainEvent
  | ShipmentCancelledDomainEvent
  | PickupCompletedDomainEvent
  | DeliveryCompletedDomainEvent;
