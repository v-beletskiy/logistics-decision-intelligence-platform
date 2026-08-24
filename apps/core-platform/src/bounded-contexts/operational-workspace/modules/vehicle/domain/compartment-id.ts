import { randomUUIDv7 } from "node:crypto";

import { UuidIdentifier } from "../../../../../shared/domain/core/uuid-identifier.js";

export class CompartmentId extends UuidIdentifier<CompartmentId> {
  private constructor(value: unknown) {
    super(value, "Compartment identifier");
  }

  static generate(): CompartmentId {
    return new CompartmentId(randomUUIDv7());
  }

  static from(value: unknown): CompartmentId {
    return new CompartmentId(value);
  }
}
