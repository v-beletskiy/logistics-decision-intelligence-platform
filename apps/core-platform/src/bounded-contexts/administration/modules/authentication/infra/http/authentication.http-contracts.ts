import type { FromSchema } from "json-schema-to-ts";

import type { loginRequestSchema } from "./authentication.schemas.js";

export type LoginRequest = FromSchema<typeof loginRequestSchema>;

export interface AccessTokenResponse {
  readonly accessToken: string;
  readonly tokenType: "Bearer";
  readonly expiresIn: number;
}
