import { randomUUIDv7 } from "node:crypto";

import { UuidIdentifier } from "../../../../../shared/domain/core/uuid-identifier.js";

export class DepotId extends UuidIdentifier<DepotId> {
  private constructor(value: unknown) {
    super(value, "Depot identifier");
  }

  static generate(): DepotId {
    return new DepotId(randomUUIDv7());
  }

  static from(value: unknown): DepotId {
    return new DepotId(value);
  }
}
