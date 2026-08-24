import type { CreatedAssignmentResponse } from "./assignment.http-contracts.js";

export class AssignmentHttpMapper {
  static toCreatedAssignmentResponse(id: string): CreatedAssignmentResponse {
    return { id };
  }
}
