# Integration Event Contracts (TypeScript)

JSON Schema files in `../schemas` are the language-neutral source of truth.
The generated package-root facade exposes every event contract and payload type.

To add an integration event:

1. Add a payload schema at `schemas/<producer>/<event-domain>/<event-name>/vN.schema.json`.
2. Give the schema a `title` ending in `Payload` and an immutable, versioned
   `x-event-type`.
3. Run `pnpm generate:types` from this directory.

The generated `contracts.manifest.json` locks every published event type and
schema identifier. Existing entries cannot be changed or removed; publish a new
version instead.

Consumers import contracts only from
`@logistics-decision-intelligence/integration-event-contracts`.
