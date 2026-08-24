import type { DomainEvent } from "../../../../../shared/domain/domain-event.js";

export interface AssignmentDomainEvent extends DomainEvent {}

export interface AssignmentCreatedDomainEvent extends AssignmentDomainEvent {
  readonly type: "AssignmentCreatedDomainEvent";
}
export interface VehicleReassignedDomainEvent extends AssignmentDomainEvent {
  readonly type: "VehicleReassignedDomainEvent";
}
export interface DriverReassignedDomainEvent extends AssignmentDomainEvent {
  readonly type: "DriverReassignedDomainEvent";
}
export interface AssignmentStartedDomainEvent extends AssignmentDomainEvent {
  readonly type: "AssignmentStartedDomainEvent";
}
export interface AssignmentCompletedDomainEvent extends AssignmentDomainEvent {
  readonly type: "AssignmentCompletedDomainEvent";
}
export interface AssignmentCancelledDomainEvent extends AssignmentDomainEvent {
  readonly type: "AssignmentCancelledDomainEvent";
}

export type AssignmentEvent =
  | AssignmentCreatedDomainEvent
  | VehicleReassignedDomainEvent
  | DriverReassignedDomainEvent
  | AssignmentStartedDomainEvent
  | AssignmentCompletedDomainEvent
  | AssignmentCancelledDomainEvent;
