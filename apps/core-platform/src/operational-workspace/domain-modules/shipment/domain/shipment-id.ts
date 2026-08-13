import { randomUUIDv7 } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class ShipmentId extends UuidIdentifier<ShipmentId> {
  private constructor(value: unknown) {
    super(value, "Shipment identifier");
  }

  static generate(): ShipmentId {
    return new ShipmentId(randomUUIDv7());
  }

  static from(value: unknown): ShipmentId {
    return new ShipmentId(value);
  }
}
