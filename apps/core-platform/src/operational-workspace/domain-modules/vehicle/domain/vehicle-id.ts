import { randomUUID } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class VehicleId extends UuidIdentifier<VehicleId> {
  private constructor(value: unknown) {
    super(value, "Vehicle identifier");
  }

  static generate(): VehicleId {
    return new VehicleId(randomUUID());
  }

  static from(value: unknown): VehicleId {
    return new VehicleId(value);
  }
}
