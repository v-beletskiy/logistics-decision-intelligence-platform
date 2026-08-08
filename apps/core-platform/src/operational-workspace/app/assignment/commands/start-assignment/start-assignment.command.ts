import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class StartAssignmentCommand {
  constructor(
    readonly assignmentId: string,
    readonly identity: Identity,
  ) {}
}
