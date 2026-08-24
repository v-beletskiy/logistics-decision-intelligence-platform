import envelopeV1Schema from "../../schemas/envelope/v1.schema.json" with { type: "json" };

import type { JsonSchema } from "./contract.js";

export type { IntegrationEventEnvelopeV1 } from "./generated/envelope/v1.js";

export const integrationEventEnvelopeV1Schema: JsonSchema = envelopeV1Schema;
