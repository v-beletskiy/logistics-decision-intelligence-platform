import type { DomainEvent } from "../../../../../shared/domain/domain-event";

export interface DriverDomainEvent extends DomainEvent {}

export interface DriverRegisteredDomainEvent extends DriverDomainEvent {
  readonly type: "DriverRegisteredDomainEvent";
}
export interface DriverDetailsUpdatedDomainEvent extends DriverDomainEvent {
  readonly type: "DriverDetailsUpdatedDomainEvent";
}
export interface DriverMarkedAvailableDomainEvent extends DriverDomainEvent {
  readonly type: "DriverMarkedAvailableDomainEvent";
}
export interface DriverMarkedUnavailableDomainEvent extends DriverDomainEvent {
  readonly type: "DriverMarkedUnavailableDomainEvent";
}
export interface DriverSuspendedDomainEvent extends DriverDomainEvent {
  readonly type: "DriverSuspendedDomainEvent";
}
export interface DriverReinstatedDomainEvent extends DriverDomainEvent {
  readonly type: "DriverReinstatedDomainEvent";
}
export interface DriverCertificationAddedDomainEvent extends DriverDomainEvent {
  readonly type: "DriverCertificationAddedDomainEvent";
  readonly certificationId: string;
}
export interface DriverCertificationUpdatedDomainEvent extends DriverDomainEvent {
  readonly type: "DriverCertificationUpdatedDomainEvent";
  readonly certificationId: string;
}
export interface DriverCertificationRemovedDomainEvent extends DriverDomainEvent {
  readonly type: "DriverCertificationRemovedDomainEvent";
  readonly certificationId: string;
}

export type DriverEvent =
  | DriverRegisteredDomainEvent
  | DriverDetailsUpdatedDomainEvent
  | DriverMarkedAvailableDomainEvent
  | DriverMarkedUnavailableDomainEvent
  | DriverSuspendedDomainEvent
  | DriverReinstatedDomainEvent
  | DriverCertificationAddedDomainEvent
  | DriverCertificationUpdatedDomainEvent
  | DriverCertificationRemovedDomainEvent;
