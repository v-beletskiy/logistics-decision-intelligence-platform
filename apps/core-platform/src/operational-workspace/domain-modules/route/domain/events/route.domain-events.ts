import type { DomainEvent } from "../../../../../shared/domain/shared-kernel/events/domain-event";

export interface RouteDomainEvent extends DomainEvent {}

export interface RouteCreatedDomainEvent extends RouteDomainEvent {
  readonly type: "RouteCreatedDomainEvent";
}

export interface RouteStartedDomainEvent extends RouteDomainEvent {
  readonly type: "RouteStartedDomainEvent";
}

export interface RouteCompletedDomainEvent extends RouteDomainEvent {
  readonly type: "RouteCompletedDomainEvent";
}

export interface RouteCancelledDomainEvent extends RouteDomainEvent {
  readonly type: "RouteCancelledDomainEvent";
}

export type RouteEvent =
  | RouteCreatedDomainEvent
  | RouteStartedDomainEvent
  | RouteCompletedDomainEvent
  | RouteCancelledDomainEvent;
