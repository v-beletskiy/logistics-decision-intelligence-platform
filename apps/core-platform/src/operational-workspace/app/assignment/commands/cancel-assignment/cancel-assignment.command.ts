import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class CancelAssignmentCommand {
  constructor(
    readonly assignmentId: string,
    readonly identity: Identity,
  ) {}
}
