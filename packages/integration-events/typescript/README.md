# Integration Events — TypeScript

Runtime CloudEvent primitives for contracts published by
`@logistics-decision-intelligence/integration-event-contracts`.

- `IntegrationEventFactory` creates events for one stable producer source.
- `IntegrationEventDecoder` compiles accepted contracts once and validates the
  envelope, event type, schema identifier, and payload.
- Contract-derived types keep payloads correlated with their versioned event
  type.

Applications own subscriptions, topology, Inbox processing, and transactional
outbox persistence. Domain code does not depend on this package.
