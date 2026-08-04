import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class ChangeDriverAvailabilityCommand {
  constructor(
    readonly driverId: string,
    readonly available: boolean,
    readonly identity: Identity,
  ) {}
}
