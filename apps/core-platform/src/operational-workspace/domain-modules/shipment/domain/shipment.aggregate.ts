import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Aggregate } from "../../../../shared/domain/shared-kernel/core/aggregate";
import { DomainException } from "../../../../shared/domain/shared-kernel/exceptions/domain.exception";
import {
  Dimensions,
  type DimensionsProps,
  Weight,
  type WeightProps,
} from "../../../../shared/domain/shared-kernel/value-objects/measurement";

import type { ShipmentEvent } from "./events/shipment.domain-events";
import {
  ShipmentEndpoint,
  type ShipmentEndpointProps,
} from "./shipment-endpoint.value-object";
import { ShipmentId } from "./shipment-id";

export enum ShipmentStatus {
  Created = "CREATED",
  Planned = "PLANNED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
}

/** Business properties accepted when a shipment is created or updated. */
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

    const validatedDetails = Shipment.validateDetails(props);
    this._pickup = validatedDetails.pickup;
    this._delivery = validatedDetails.delivery;
    this._weight = validatedDetails.weight;
    this._dimensions = validatedDetails.dimensions;
    this._pickup = requireShipmentEndpoint(props.pickup, "pickup");
    this._delivery = requireShipmentEndpoint(props.delivery, "delivery");
    this._weight = Weight.create(props.weight);
    this._dimensions = Dimensions.create(props.dimensions);
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
    const shipment = new Shipment(
      ShipmentId.generate(),
      {
        pickup: ShipmentEndpoint.create(details.pickup),
        delivery: ShipmentEndpoint.create(details.delivery),
        weight: Weight.create(details.weight),
        dimensions: Dimensions.create(details.dimensions),
        pickupCompleted: false,
        deliveryCompleted: false,
        status: ShipmentStatus.Created,
      },
    );
    shipment.raiseDomainEvent("ShipmentCreatedDomainEvent");
    return shipment;
  }

  static reconstitute(id: ShipmentId, props: ShipmentProps): Shipment {
    return new Shipment(id, props);
  }

  private static validateDetails(
    details: ShipmentDetails,
  ): Pick<ShipmentProps, "pickup" | "delivery" | "weight" | "dimensions"> {
    return {
      pickup: requireShipmentEndpoint(
        ShipmentEndpoint.create(details.pickup),
        "pickup",
      ),
      delivery: requireShipmentEndpoint(
        ShipmentEndpoint.create(details.delivery),
        "delivery",
      ),
      weight: Weight.create(details.weight),
      dimensions: Dimensions.create(details.dimensions),
    };
  }

  updateDetails(details: ShipmentDetails): void {
    this.assertMutable();
    const validatedDetails = Shipment.validateDetails(details);
    this._pickup = validatedDetails.pickup;
    this._delivery = validatedDetails.delivery;
    this._weight = validatedDetails.weight;
    this._dimensions = validatedDetails.dimensions;
    this.raiseDomainEvent("ShipmentDetailsUpdatedDomainEvent");
  }

  completePickup(): void {
    this.assertExecutable();
    if (this._pickupCompleted) {
      throw new DomainException("The shipment pickup is already completed.");
    }
    this._pickupCompleted = true;
    this.raiseDomainEvent("PickupCompletedDomainEvent");
  }

  completeDelivery(): void {
    this.assertExecutable();
    if (this._deliveryCompleted) {
      throw new DomainException("The shipment delivery is already completed.");
    }
    if (!this._pickupCompleted) {
      throw new DomainException(
        "The shipment pickup must be completed before the delivery.",
      );
    }
    this._deliveryCompleted = true;
    this._status = ShipmentStatus.Completed;
    this.raiseDomainEvent("DeliveryCompletedDomainEvent");
  }

  cancel(): void {
    if (this._status === ShipmentStatus.Completed) {
      throw new DomainException("A completed shipment cannot be cancelled.");
    }
    if (this._status === ShipmentStatus.Cancelled) {
      throw new DomainException("A shipment is already cancelled.");
    }
    this._status = ShipmentStatus.Cancelled;
    this.raiseDomainEvent("ShipmentCancelledDomainEvent");
  }

  private assertMutable(): void {
    if (this._status === ShipmentStatus.Cancelled) {
      throw new DomainException("A cancelled shipment cannot be modified.");
    }
    if (this._status === ShipmentStatus.Completed) {
      throw new DomainException("A completed shipment cannot be modified.");
    }
  }

  private assertExecutable(): void {
    if (this._status === ShipmentStatus.Cancelled) {
      throw new DomainException("A cancelled shipment cannot be executed.");
    }
    if (this._status === ShipmentStatus.Completed) {
      throw new DomainException("A completed shipment cannot be executed.");
    }
  }

  private assertPickupPrecedesDelivery(): void {
    if (this._deliveryCompleted && !this._pickupCompleted) {
      throw new DomainException(
        "The shipment pickup must be completed before the delivery.",
      );
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
    throw new DomainException(`A shipment must have exactly one ${label}.`);
  }
  return value;
}

function requireShipmentStatus(value: unknown): ShipmentStatus {
  if (!isEnumValue(ShipmentStatus, value)) {
    throw new DomainException("A shipment status is invalid.");
  }
  return value;
}
