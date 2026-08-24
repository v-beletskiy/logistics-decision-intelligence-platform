import type { Identity } from "../identity/identity.js";

export abstract class IdentityTokenVerifier {
  abstract verify(token: string): Promise<Identity>;
}
