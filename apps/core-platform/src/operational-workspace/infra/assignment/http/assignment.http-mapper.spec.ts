import * as assert from "node:assert/strict";
import { test } from "node:test";

import { AssignmentHttpMapper } from "./assignment.http-mapper";

test("AssignmentHttpMapper maps a created assignment response", () => {
  assert.deepEqual(
    AssignmentHttpMapper.toCreatedAssignmentResponse("assignment-id"),
    { id: "assignment-id" },
  );
});