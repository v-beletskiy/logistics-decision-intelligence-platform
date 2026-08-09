# Integration Contracts (TypeScript)

JSON Schema files in `../schemas` are the language-neutral source of truth.
The generated package-root facade exposes every event contract and payload type.

To add an integration event:

1. Add a payload schema at `schemas/<producer>/<event-domain>/<event-name>/vN.schema.json`.
2. Give the schema a `title` ending in `Payload`.
3. Run `pnpm generate:types` from this directory.

The event type is derived from the schema path after `<producer>`. For example,
`schemas/core-platform/decision-intelligence/recommendation-analysis-requested/v1.schema.json`
publishes `decision-intelligence.recommendation-analysis-requested.v1`.

Consumers import contracts only from
`@logistics-decision-intelligence/integration-contracts`.
