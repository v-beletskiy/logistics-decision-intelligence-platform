import { randomUUIDv7 } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class AssignmentShipmentId extends UuidIdentifier<AssignmentShipmentId> {
  private constructor(value: unknown) {
    super(value, "Assignment shipment identifier");
  }

  static generate(): AssignmentShipmentId {
    return new AssignmentShipmentId(randomUUIDv7());
  }

  static from(value: unknown): AssignmentShipmentId {
    return new AssignmentShipmentId(value);
  }
}
