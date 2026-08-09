import * as assert from "node:assert/strict";
import { test } from "node:test";

import { EventEmitter2 } from "@nestjs/event-emitter";

import type { InternalApplicationEvent } from "../../../app/messaging/internal-application-event-bus";
import { InMemoryApplicationEventBus } from "./in-memory-application-event-bus";

test("delivers a trusted internal application event to subscribed bounded-context handlers", async () => {
  const eventEmitter = new EventEmitter2();
  const bus = new InMemoryApplicationEventBus(eventEmitter);
  const event: InternalApplicationEvent<{ readonly routeId: string }> = {
    type: "operational-workspace.route-optimization-input-changed",
    payload: { routeId: "route-1" },
  };
  let received:
    | InternalApplicationEvent<{ readonly routeId: string }>
    | undefined;

  eventEmitter.on(event.type, async (receivedEvent: typeof event) => {
    received = receivedEvent;
  });

  await bus.publish(event);

  assert.equal(received, event);
});
