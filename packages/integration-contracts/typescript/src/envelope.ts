import envelopeV1Schema from "../../schemas/envelope/v1.schema.json";

import type { JsonSchema } from "./contract";

export type { IntegrationEventEnvelopeV1 } from "./generated/envelope/v1";

export const integrationEventEnvelopeV1Schema: JsonSchema = envelopeV1Schema;
