import type { DomainEvent } from "../../../../../shared/domain/shared-kernel/events/domain-event";

export interface DepotDomainEvent extends DomainEvent {}

export interface DepotCreatedDomainEvent extends DepotDomainEvent {
  readonly type: "DepotCreatedDomainEvent";
}
export interface DepotDetailsUpdatedDomainEvent extends DepotDomainEvent {
  readonly type: "DepotDetailsUpdatedDomainEvent";
}
export interface DepotVehicleCapacityUpdatedDomainEvent extends DepotDomainEvent {
  readonly type: "DepotVehicleCapacityUpdatedDomainEvent";
}
export interface DepotDriverCapacityUpdatedDomainEvent extends DepotDomainEvent {
  readonly type: "DepotDriverCapacityUpdatedDomainEvent";
}
export interface DepotActivatedDomainEvent extends DepotDomainEvent {
  readonly type: "DepotActivatedDomainEvent";
}
export interface DepotInactivatedDomainEvent extends DepotDomainEvent {
  readonly type: "DepotInactivatedDomainEvent";
}
export interface DepotClosedDomainEvent extends DepotDomainEvent {
  readonly type: "DepotClosedDomainEvent";
}

export type DepotEvent =
  | DepotCreatedDomainEvent
  | DepotDetailsUpdatedDomainEvent
  | DepotVehicleCapacityUpdatedDomainEvent
  | DepotDriverCapacityUpdatedDomainEvent
  | DepotActivatedDomainEvent
  | DepotInactivatedDomainEvent
  | DepotClosedDomainEvent;
