import { DomainConflictException } from "../../../../shared/domain/shared-kernel/domain.exceptions";

export class ShipmentPickupAlreadyCompletedException extends DomainConflictException {
  constructor() {
    super(
      "The shipment pickup is already completed.",
      "shipment.pickup-already-completed",
    );
  }
}

export class ShipmentDeliveryAlreadyCompletedException extends DomainConflictException {
  constructor() {
    super(
      "The shipment delivery is already completed.",
      "shipment.delivery-already-completed",
    );
  }
}

export class ShipmentDeliveryRequiresPickupException extends DomainConflictException {
  constructor() {
    super(
      "The shipment pickup must be completed before the delivery.",
      "shipment.delivery-requires-pickup",
    );
  }
}

export class ShipmentAlreadyCancelledException extends DomainConflictException {
  constructor() {
    super("A shipment is already cancelled.", "shipment.already-cancelled");
  }
}

export class ShipmentCompletedCancellationException extends DomainConflictException {
  constructor() {
    super(
      "A completed shipment cannot be cancelled.",
      "shipment.cancellation-of-completed",
    );
  }
}

export class ShipmentModificationNotAllowedException extends DomainConflictException {
  constructor(reason: "cancelled" | "completed") {
    super(
      reason === "cancelled"
        ? "A cancelled shipment cannot be modified."
        : "A completed shipment cannot be modified.",
      "shipment.modification-not-allowed",
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
      "shipment.execution-not-allowed",
      { reason },
    );
  }
}
