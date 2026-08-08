import { randomUUID } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class DepotId extends UuidIdentifier<DepotId> {
  private constructor(value: unknown) {
    super(value, "Depot identifier");
  }

  static generate(): DepotId {
    return new DepotId(randomUUID());
  }

  static from(value: unknown): DepotId {
    return new DepotId(value);
  }
}
