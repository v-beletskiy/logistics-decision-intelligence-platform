import type { DomainEvent } from "../../../../../shared/domain/domain-event.js";

export interface RouteStopDomainEvent extends DomainEvent {
  readonly routeId: string;
}

export interface RouteStopArrivedDomainEvent extends RouteStopDomainEvent {
  readonly type: "RouteStopArrivedDomainEvent";
}

export interface RouteStopDepartedDomainEvent extends RouteStopDomainEvent {
  readonly type: "RouteStopDepartedDomainEvent";
}

export interface RouteStopCancelledDomainEvent extends RouteStopDomainEvent {
  readonly type: "RouteStopCancelledDomainEvent";
}

export type RouteStopEvent =
  | RouteStopArrivedDomainEvent
  | RouteStopDepartedDomainEvent
  | RouteStopCancelledDomainEvent;
