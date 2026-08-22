import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Route, RouteStatus } from "./route.aggregate";
import { RouteId } from "./route-id";

test("Route serializes stop progression without loading stops", () => {
  const route = Route.create({ plannedStopCount: 2 });
  assert.throws(() => route.start(false), /requires a running assignment/);

  route.start(true);
  route.startStop(1);
  assert.equal(route.activeStopSequence, 1);
  assert.throws(() => route.startStop(1), /already active/);
  assert.throws(() => route.completeStop(2), /executed in sequence/);

  route.completeStop(1);
  assert.equal(route.nextPermittedStopSequence, 2);
  assert.equal(route.activeStopSequence, undefined);
  route.startStop(2);
  route.completeStop(2);
  route.complete();

  assert.equal(route.status, RouteStatus.Completed);
});

test("Route reconstitution rejects inconsistent execution progression", () => {
  assert.throws(
    () =>
      Route.reconstitute(RouteId.generate(), {
        status: RouteStatus.InProgress,
        plannedStopCount: 3,
        nextPermittedStopSequence: 2,
        activeStopSequence: 1,
      }),
    /active stop sequence is invalid/,
  );
});
