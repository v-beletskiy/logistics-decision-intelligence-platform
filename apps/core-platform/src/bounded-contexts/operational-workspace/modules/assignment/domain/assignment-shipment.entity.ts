import { ASSIGNMENT_ERROR_CODES } from "./assignment-error-codes.js";
import { Entity } from "../../../../../shared/domain/core/entity.js";
import { DomainException } from "../../../../../shared/domain/domain.exceptions.js";
import {
  Dimensions,
  Weight,
} from "../../../../../shared/domain/value-objects/measurement/index.js";

import { AssignmentShipmentId } from "./assignment-shipment-id.js";
import { ShipmentId } from "../../shipment/domain/shipment-id.js";

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
    this.shipmentId = props.shipmentId;
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

function requireAssignmentShipmentWeight(value: unknown): Weight {
  if (!(value instanceof Weight)) {
    throw new DomainException(
      "An assignment shipment weight is invalid.",
      ASSIGNMENT_ERROR_CODES.assignmentShipmentWeightIsInvalid,
    );
  }
  return value;
}

function requireAssignmentShipmentDimensions(value: unknown): Dimensions {
  if (!(value instanceof Dimensions)) {
    throw new DomainException(
      "An assignment shipment dimensions are invalid.",
      ASSIGNMENT_ERROR_CODES.assignmentShipmentDimensionsAreInvalid,
    );
  }
  return value;
}
