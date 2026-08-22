import { ServiceScope } from "../scopes/service-scope.enum";
import { IdentityType } from "./identity-type.enum";
import type { ServiceIdentity } from "./identity";

export type SystemPrincipal = Readonly<Omit<ServiceIdentity, "tenantId">>;

/** Stable, non-secret identities reserved for trusted in-process principals. */
export const SYSTEM_PRINCIPALS = Object.freeze({
  decisionIntelligenceOptimization: Object.freeze({
    id: "00000000-0000-4000-8000-000000000001",
    type: IdentityType.Service,
    scopes: Object.freeze([ServiceScope.RouteAnalysisRead]),
  }),
}) satisfies Readonly<Record<string, SystemPrincipal>>;
