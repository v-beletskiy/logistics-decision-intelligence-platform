import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class SuspendDriverCommand {
  constructor(
    readonly driverId: string,
    readonly identity: Identity,
  ) {}
}
