import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../../../shared/domain/shared-kernel/exceptions/domain.exception";
import { Aggregate } from "../../../../shared/domain/shared-kernel/core/aggregate";
import type { PersistencePlan } from "../../../../shared/domain/shared-kernel/core/persistence-plan";
import type { ChildChangeSet } from "../../../../shared/domain/shared-kernel/core/child-changes";
import { ChildCollection } from "../../../../shared/domain/shared-kernel/core/child-collection";

import type { RouteEvent } from "./events/route.domain-events";
import { RouteId } from "./route-id";
import { RouteStopId } from "./route-stop-id";
import {
  RouteStop,
  RouteStopDetails,
  RouteStopOperationType,
  RouteStopSnapshot,
  RouteStopStatus,
} from "./route-stop.entity";

export enum RouteStatus {
  Draft = "DRAFT",
  Planned = "PLANNED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
}

/** Business properties used to create a route. */
export interface RouteDetails {
  readonly stops: readonly RouteStopDetails[];
}

/** Complete Route state, excluding only the Route identity. */
export interface RouteProps {
  readonly stops: readonly RouteStop[];
  readonly status: RouteStatus;
}

/** Persistence decisions derived from the aggregate state since it was loaded. */
export interface RoutePersistencePlan extends PersistencePlan {
  readonly stops: ChildChangeSet<RouteStop>;
}

/** Operational plan for the ordered pickup and delivery execution of shipments. */
export class Route extends Aggregate<RouteId, RouteEvent> {
  private readonly _stops: ChildCollection<RouteStop>;
  private _status: RouteStatus;

  private constructor(id: RouteId, props: RouteProps, isNew: boolean) {
    super(id, isNew);
    this._status = props.status;
    if (!isEnumValue(RouteStatus, this._status)) {
      throw new DomainException("A route status is invalid.");
    }
    this._stops = new ChildCollection(
      (stop) => stop.id.value,
      copyAndValidateStops(props.stops),
      isNew,
    );
    this.assertStructureIsValid();
  }

  get status(): RouteStatus {
    return this._status;
  }

  get stops(): readonly RouteStopSnapshot[] {
    return this._stops.all().map((stop) => stop.toSnapshot());
  }

  static create(details: RouteDetails): Route {
    const route = new Route(
      RouteId.generate(),
      {
        stops: details.stops.map((stop) => RouteStop.create(stop)),
        status: RouteStatus.Planned,
      },
      true,
    );
    route.raiseDomainEvent("RouteCreatedDomainEvent");
    return route;
  }

  static reconstitute(id: RouteId, props: RouteProps): Route {
    return new Route(id, props, false);
  }

  getPersistencePlan(): RoutePersistencePlan {
    return { ...super.getPersistencePlan(), stops: this._stops.changes() };
  }

  start(hasRunningAssignment: boolean): void {
    if (!hasRunningAssignment) {
      throw new DomainException(
        "A route requires a running assignment before it can start.",
      );
    }
    if (this._status !== RouteStatus.Planned) {
      throw new DomainException("Only a planned route can be started.");
    }
    this._status = RouteStatus.InProgress;
    this.raiseDomainEvent("RouteStartedDomainEvent");
  }

  startRouteStop(stopId: RouteStopId): void {
    if (this._status !== RouteStatus.InProgress) {
      throw new DomainException(
        "Route stop start requires an in-progress route.",
      );
    }
    const stop = this.findStop(stopId);
    const stops = this._stops.all();
    const priorStops = stops.slice(0, stops.indexOf(stop));
    const hasNonCompletedPriorStop = priorStops.some(
      (candidate) => candidate.status !== RouteStopStatus.Completed,
    );
    if (hasNonCompletedPriorStop) {
      throw new DomainException("Route stops must be executed in sequence.");
    }
    stop.start();
    this._stops.touch(stop.id.value);
  }

  completeStop(stopId: RouteStopId): void {
    if (this._status !== RouteStatus.InProgress) {
      throw new DomainException(
        "Route stop completion requires an in-progress route.",
      );
    }
    const stop = this.findStop(stopId);
    stop.complete();
    this._stops.touch(stop.id.value);
  }

  complete(): void {
    if (this._status !== RouteStatus.InProgress) {
      throw new DomainException(
        "Route stop execution requires an in-progress route.",
      );
    }

    const hasNonCompletedStop = this._stops
      .all()
      .some((stop) => stop.status !== RouteStopStatus.Completed);
    if (hasNonCompletedStop) {
      throw new DomainException(
        "All route stops must be completed before the route can be completed.",
      );
    }
    this._status = RouteStatus.Completed;
    this.raiseDomainEvent("RouteCompletedDomainEvent");
  }

  cancel(): void {
    if (this._status === RouteStatus.Completed) {
      throw new DomainException("A completed route cannot be cancelled.");
    }
    if (this._status === RouteStatus.Cancelled) {
      throw new DomainException("A cancelled route cannot be cancelled again.");
    }
    this._status = RouteStatus.Cancelled;
    this.raiseDomainEvent("RouteCancelledDomainEvent");
  }

  private assertStructureIsValid(): void {
    const stops = this._stops.all();
    if (stops.length < 2) {
      throw new DomainException(
        "A route must contain at least one pickup and one delivery stop.",
      );
    }
    const perShipment = new Map<string, RouteStop[]>();
    for (const stop of stops) {
      const shipmentStops = perShipment.get(stop.shipmentId) ?? [];
      shipmentStops.push(stop);
      perShipment.set(stop.shipmentId, shipmentStops);
    }
    for (const [shipmentId, shipmentStops] of perShipment) {
      const pickups = shipmentStops.filter(
        (stop) => stop.operationType === RouteStopOperationType.Pickup,
      );
      const deliveries = shipmentStops.filter(
        (stop) => stop.operationType === RouteStopOperationType.Delivery,
      );
      if (pickups.length !== 1 || deliveries.length !== 1) {
        throw new DomainException(
          `Shipment ${shipmentId} must have exactly one pickup and one delivery route stop.`,
        );
      }
      if (stops.indexOf(pickups[0]) > stops.indexOf(deliveries[0])) {
        throw new DomainException(
          `The pickup for shipment ${shipmentId} must precede its delivery.`,
        );
      }
    }
  }

  private findStop(stopId: RouteStopId): RouteStop {
    const stop = this._stops
      .all()
      .find((candidate) => candidate.id.equals(stopId));
    if (!stop)
      throw new DomainException(
        "The route stop does not belong to this route.",
      );
    return stop;
  }

  private raiseDomainEvent(
    type: RouteEvent["type"],
    details: Partial<RouteEvent> = {},
  ): void {
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type,
      ...details,
    } as RouteEvent);
  }
}

function copyAndValidateStops(stops: readonly RouteStop[]): RouteStop[] {
  if (!Array.isArray(stops)) {
    throw new DomainException("Route stops must be specified as a list.");
  }
  if (stops.some((stop) => !(stop instanceof RouteStop))) {
    throw new DomainException("Route stops must be valid route-stop entities.");
  }
  if (new Set(stops.map((stop) => stop.id.value)).size !== stops.length) {
    throw new DomainException("Route stop identifiers must be unique.");
  }
  return [...stops];
}
