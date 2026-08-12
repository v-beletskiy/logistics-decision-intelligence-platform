import { randomUUID } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class DriverCertificationId extends UuidIdentifier<DriverCertificationId> {
  private constructor(value: unknown) {
    super(value, "Driver certification identifier");
  }

  static generate(): DriverCertificationId {
    return new DriverCertificationId(randomUUID());
  }

  static from(value: unknown): DriverCertificationId {
    return new DriverCertificationId(value);
  }
}
