import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class ReinstateDriverCommand {
  constructor(
    readonly driverId: string,
    readonly identity: Identity,
  ) {}
}
