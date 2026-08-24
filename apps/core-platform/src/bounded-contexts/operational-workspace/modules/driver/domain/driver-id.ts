import { randomUUIDv7 } from "node:crypto";

import { UuidIdentifier } from "../../../../../shared/domain/core/uuid-identifier.js";

export class DriverId extends UuidIdentifier<DriverId> {
  private constructor(value: unknown) {
    super(value, "Driver identifier");
  }

  static generate(): DriverId {
    return new DriverId(randomUUIDv7());
  }

  static from(value: unknown): DriverId {
    return new DriverId(value);
  }
}
