import { Entity } from "../../../../shared/domain/shared-kernel/core/entity";
import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";
import {
  Dimensions,
  Weight,
} from "../../../../shared/domain/shared-kernel/value-objects/measurement";

import { AssignmentShipmentId } from "./assignment-shipment-id";
import { ShipmentId } from "../../shipment/domain/shipment-id";

/** Complete AssignmentShipment state, excluding only its identity. */
export interface AssignmentShipmentProps {
  readonly shipmentId: ShipmentId;
  readonly weight: Weight;
  readonly dimensions: Dimensions;
}

/**
 * A shipment bound to an assignment, carrying the load committed at assignment
 * time so the aggregate owns its capacity commitment independently of the
 * Shipment aggregate.
 */
export class AssignmentShipment extends Entity<AssignmentShipmentId> {
  readonly shipmentId: ShipmentId;
  readonly weight: Weight;
  readonly dimensions: Dimensions;

  private constructor(
    id: AssignmentShipmentId,
    props: AssignmentShipmentProps,
  ) {
    super(id);
    this.shipmentId = requireAssignmentShipmentReference(props.shipmentId);
    this.weight = requireAssignmentShipmentWeight(props.weight);
    this.dimensions = requireAssignmentShipmentDimensions(props.dimensions);
  }

  static create(props: AssignmentShipmentProps): AssignmentShipment {
    return new AssignmentShipment(AssignmentShipmentId.generate(), props);
  }

  static reconstitute(
    id: AssignmentShipmentId,
    props: AssignmentShipmentProps,
  ): AssignmentShipment {
    return new AssignmentShipment(id, props);
  }
}

function requireAssignmentShipmentReference(value: unknown): ShipmentId {
  if (!(value instanceof ShipmentId)) {
    throw new DomainException(
      "An assignment shipment must reference a shipment.",
    );
  }
  return value;
}

function requireAssignmentShipmentWeight(value: unknown): Weight {
  if (!(value instanceof Weight)) {
    throw new DomainException("An assignment shipment weight is invalid.");
  }
  return value;
}

function requireAssignmentShipmentDimensions(value: unknown): Dimensions {
  if (!(value instanceof Dimensions)) {
    throw new DomainException("An assignment shipment dimensions are invalid.");
  }
  return value;
}
