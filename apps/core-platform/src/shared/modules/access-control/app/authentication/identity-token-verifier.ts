import type { Identity } from "../identity/identity";

export abstract class IdentityTokenVerifier {
  abstract verify(token: string): Promise<Identity>;
}
