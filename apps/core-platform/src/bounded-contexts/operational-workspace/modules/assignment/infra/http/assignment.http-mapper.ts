import type { CreatedAssignmentResponse } from "./assignment.http-contracts";

export class AssignmentHttpMapper {
  static toCreatedAssignmentResponse(id: string): CreatedAssignmentResponse {
    return { id };
  }
}
