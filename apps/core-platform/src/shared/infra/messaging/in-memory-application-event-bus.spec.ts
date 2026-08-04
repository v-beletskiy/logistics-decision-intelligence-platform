import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { InMemoryApplicationEventBus } from './in-memory-application-event-bus';
import type { IntegrationEvent } from './integration-event';

test('delivers an integration event to subscribed bounded-context handlers', async () => {
  const eventEmitter = new EventEmitter2();
  const bus = new InMemoryApplicationEventBus(eventEmitter);
  const event: IntegrationEvent = {
    eventId: '7fd37f50-7510-41a4-a54c-51b1924530ed',
    eventType: 'operational-workspace.route.created.v1',
    eventVersion: 1,
    occurredAt: new Date('2026-08-01T00:00:00.000Z'),
    tenantId: 'e75a6194-423a-4e59-94f1-0876fc583a0b',
    payload: { routeId: 'route-1' },
  };
  let received: IntegrationEvent | undefined;

  eventEmitter.on(event.eventType, async (receivedEvent: IntegrationEvent) => {
    received = receivedEvent;
  });

  await bus.publish(event);

  assert.equal(received, event);
});
