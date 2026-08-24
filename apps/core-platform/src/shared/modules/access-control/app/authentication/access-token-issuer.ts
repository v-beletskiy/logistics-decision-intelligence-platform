import type { UserIdentity } from "../identity/identity.js";

export interface IssuedAccessToken {
  readonly accessToken: string;
  readonly tokenType: "Bearer";
  readonly expiresIn: number;
}

export abstract class AccessTokenIssuer {
  abstract issue(identity: UserIdentity): Promise<IssuedAccessToken>;
}
