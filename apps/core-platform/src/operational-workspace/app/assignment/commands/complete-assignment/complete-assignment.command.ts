import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class CompleteAssignmentCommand {
  constructor(
    readonly assignmentId: string,
    readonly identity: Identity,
  ) {}
}
