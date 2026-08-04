import { randomUUID } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class DriverId extends UuidIdentifier<DriverId> {
  private constructor(value: unknown) {
    super(value, "Driver identifier");
  }

  static generate(): DriverId {
    return new DriverId(randomUUID());
  }

  static from(value: unknown): DriverId {
    return new DriverId(value);
  }
}
