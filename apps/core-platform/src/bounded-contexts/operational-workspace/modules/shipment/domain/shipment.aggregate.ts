import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Aggregate } from "../../../../../shared/domain/core/aggregate";
import { DomainException } from "../../../../../shared/domain/domain.exceptions";
import {
  Dimensions,
  type DimensionsProps,
  Weight,
  type WeightProps,
} from "../../../../../shared/domain/value-objects/measurement";

import {
  ShipmentAlreadyCancelledException,
  ShipmentCompletedCancellationException,
  ShipmentDeliveryAlreadyCompletedException,
  ShipmentDeliveryRequiresPickupException,
  ShipmentExecutionNotAllowedException,
  ShipmentModificationNotAllowedException,
  ShipmentPickupAlreadyCompletedException,
} from "./shipment.exceptions";
import type { ShipmentEvent } from "./shipment.events";
import {
  ShipmentEndpoint,
  type ShipmentEndpointProps,
} from "./shipment-endpoint.value-object";
import { ShipmentId } from "./shipment-id";
import { SHIPMENT_ERROR_CODES } from "./shipment-error-codes";

export enum ShipmentStatus {
  Created = "CREATED",
  Planned = "PLANNED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
}

export interface ShipmentDetails {
  readonly pickup: ShipmentEndpointProps;
  readonly delivery: ShipmentEndpointProps;
  readonly weight: WeightProps;
  readonly dimensions: DimensionsProps;
}

/** Complete persisted Shipment state, excluding its identity. */
export interface ShipmentProps extends ShipmentDetails {
  readonly pickup: ShipmentEndpoint;
  readonly delivery: ShipmentEndpoint;
  readonly weight: Weight;
  readonly dimensions: Dimensions;
  readonly pickupCompleted: boolean;
  readonly deliveryCompleted: boolean;
  readonly status: ShipmentStatus;
}

/** A transportation request moving goods from an origin to a destination. */
export class Shipment extends Aggregate<ShipmentId, ShipmentEvent> {
  private _pickup: ShipmentEndpoint;
  private _delivery: ShipmentEndpoint;
  private _weight: Weight;
  private _dimensions: Dimensions;
  private _pickupCompleted: boolean;
  private _deliveryCompleted: boolean;
  private _status: ShipmentStatus;

  private constructor(id: ShipmentId, props: ShipmentProps) {
    super(id);

    this._pickup = requireShipmentEndpoint(props.pickup, "pickup");
    this._delivery = requireShipmentEndpoint(props.delivery, "delivery");
    this._weight = requireShipmentWeight(props.weight);
    this._dimensions = requireShipmentDimensions(props.dimensions);
    this._pickupCompleted = props.pickupCompleted;
    this._deliveryCompleted = props.deliveryCompleted;
    this._status = requireShipmentStatus(props.status);
    this.assertPickupPrecedesDelivery();
  }

  get pickup(): ShipmentEndpoint {
    return this._pickup;
  }

  get delivery(): ShipmentEndpoint {
    return this._delivery;
  }

  get weight(): Weight {
    return this._weight;
  }

  get dimensions(): Dimensions {
    return this._dimensions;
  }

  get pickupCompleted(): boolean {
    return this._pickupCompleted;
  }

  get deliveryCompleted(): boolean {
    return this._deliveryCompleted;
  }

  get status(): ShipmentStatus {
    return this._status;
  }

  static create(details: ShipmentDetails): Shipment {
    const shipment = new Shipment(ShipmentId.generate(), {
      pickup: ShipmentEndpoint.create(details.pickup),
      delivery: ShipmentEndpoint.create(details.delivery),
      weight: Weight.create(details.weight),
      dimensions: Dimensions.create(details.dimensions),
      pickupCompleted: false,
      deliveryCompleted: false,
      status: ShipmentStatus.Created,
    });
    shipment.raiseDomainEvent("ShipmentCreatedDomainEvent");
    return shipment;
  }

  static reconstitute(id: ShipmentId, props: ShipmentProps): Shipment {
    return new Shipment(id, props);
  }

  updateDetails(details: ShipmentDetails): void {
    this.assertMutable();
    this._pickup = ShipmentEndpoint.create(details.pickup);
    this._delivery = ShipmentEndpoint.create(details.delivery);
    this._weight = Weight.create(details.weight);
    this._dimensions = Dimensions.create(details.dimensions);
    this.raiseDomainEvent("ShipmentDetailsUpdatedDomainEvent");
  }

  completePickup(): void {
    this.assertExecutable();
    if (this._pickupCompleted) {
      throw new ShipmentPickupAlreadyCompletedException();
    }
    this._pickupCompleted = true;
    this.raiseDomainEvent("PickupCompletedDomainEvent");
  }

  completeDelivery(): void {
    this.assertExecutable();
    if (this._deliveryCompleted) {
      throw new ShipmentDeliveryAlreadyCompletedException();
    }
    if (!this._pickupCompleted) {
      throw new ShipmentDeliveryRequiresPickupException();
    }
    this._deliveryCompleted = true;
    this._status = ShipmentStatus.Completed;
    this.raiseDomainEvent("DeliveryCompletedDomainEvent");
  }

  cancel(): void {
    if (this._status === ShipmentStatus.Completed) {
      throw new ShipmentCompletedCancellationException();
    }
    if (this._status === ShipmentStatus.Cancelled) {
      throw new ShipmentAlreadyCancelledException();
    }
    this._status = ShipmentStatus.Cancelled;
    this.raiseDomainEvent("ShipmentCancelledDomainEvent");
  }

  private assertMutable(): void {
    if (this._status === ShipmentStatus.Cancelled) {
      throw new ShipmentModificationNotAllowedException("cancelled");
    }
    if (this._status === ShipmentStatus.Completed) {
      throw new ShipmentModificationNotAllowedException("completed");
    }
  }

  private assertExecutable(): void {
    if (this._status === ShipmentStatus.Cancelled) {
      throw new ShipmentExecutionNotAllowedException("cancelled");
    }
    if (this._status === ShipmentStatus.Completed) {
      throw new ShipmentExecutionNotAllowedException("completed");
    }
  }

  private assertPickupPrecedesDelivery(): void {
    if (this._deliveryCompleted && !this._pickupCompleted) {
      throw new ShipmentDeliveryRequiresPickupException();
    }
  }

  private raiseDomainEvent(type: ShipmentEvent["type"]): void {
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type,
    } satisfies ShipmentEvent);
  }
}

function requireShipmentEndpoint(
  value: unknown,
  label: string,
): ShipmentEndpoint {
  if (!(value instanceof ShipmentEndpoint)) {
    throw new DomainException(
      `A shipment must have exactly one ${label}.`,
      SHIPMENT_ERROR_CODES.invalidEndpoint,
    );
  }
  return value;
}

function requireShipmentWeight(value: unknown): Weight {
  if (!(value instanceof Weight)) {
    throw new DomainException(
      "A shipment weight is invalid.",
      SHIPMENT_ERROR_CODES.invalidWeight,
    );
  }
  return value;
}

function requireShipmentDimensions(value: unknown): Dimensions {
  if (!(value instanceof Dimensions)) {
    throw new DomainException(
      "A shipment dimensions are invalid.",
      SHIPMENT_ERROR_CODES.invalidDimensions,
    );
  }
  return value;
}

function requireShipmentStatus(value: unknown): ShipmentStatus {
  if (!isEnumValue(ShipmentStatus, value)) {
    throw new DomainException(
      "A shipment status is invalid.",
      SHIPMENT_ERROR_CODES.invalidStatus,
    );
  }
  return value;
}
