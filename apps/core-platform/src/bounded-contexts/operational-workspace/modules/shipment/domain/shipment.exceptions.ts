import { DomainConflictException } from "../../../../../shared/domain/domain.exceptions";
import { SHIPMENT_ERROR_CODES } from "./shipment-error-codes";

export class ShipmentPickupAlreadyCompletedException extends DomainConflictException {
  constructor() {
    super(
      "The shipment pickup is already completed.",
      SHIPMENT_ERROR_CODES.pickupAlreadyCompleted,
    );
  }
}

export class ShipmentDeliveryAlreadyCompletedException extends DomainConflictException {
  constructor() {
    super(
      "The shipment delivery is already completed.",
      SHIPMENT_ERROR_CODES.deliveryAlreadyCompleted,
    );
  }
}

export class ShipmentDeliveryRequiresPickupException extends DomainConflictException {
  constructor() {
    super(
      "The shipment pickup must be completed before the delivery.",
      SHIPMENT_ERROR_CODES.deliveryRequiresPickup,
    );
  }
}

export class ShipmentAlreadyCancelledException extends DomainConflictException {
  constructor() {
    super(
      "A shipment is already cancelled.",
      SHIPMENT_ERROR_CODES.alreadyCancelled,
    );
  }
}

export class ShipmentCompletedCancellationException extends DomainConflictException {
  constructor() {
    super(
      "A completed shipment cannot be cancelled.",
      SHIPMENT_ERROR_CODES.completedCancellation,
    );
  }
}

export class ShipmentModificationNotAllowedException extends DomainConflictException {
  constructor(reason: "cancelled" | "completed") {
    super(
      reason === "cancelled"
        ? "A cancelled shipment cannot be modified."
        : "A completed shipment cannot be modified.",
      SHIPMENT_ERROR_CODES.modificationNotAllowed,
      { reason },
    );
  }
}

export class ShipmentExecutionNotAllowedException extends DomainConflictException {
  constructor(reason: "cancelled" | "completed") {
    super(
      reason === "cancelled"
        ? "A cancelled shipment cannot be executed."
        : "A completed shipment cannot be executed.",
      SHIPMENT_ERROR_CODES.executionNotAllowed,
      { reason },
    );
  }
}
