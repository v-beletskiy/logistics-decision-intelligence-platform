import { randomUUID } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class CompartmentId extends UuidIdentifier<CompartmentId> {
  private constructor(value: unknown) {
    super(value, "Compartment identifier");
  }

  static generate(): CompartmentId {
    return new CompartmentId(randomUUID());
  }

  static from(value: unknown): CompartmentId {
    return new CompartmentId(value);
  }
}
