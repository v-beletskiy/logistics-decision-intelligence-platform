import { ServiceScope } from "../scopes/service-scope.enum";
import { IdentityType } from "./identity-type.enum";
import type { ServiceIdentity } from "./identity";

// Used for non-human actors that enter an application use case.

export type SystemPrincipal = Readonly<Omit<ServiceIdentity, "tenantId">>;

export enum SystemPrincipalId {
  DecisionIntelligenceOptimization = "decision-intelligence:optimization",
}

/** Stable, non-secret identities reserved for trusted in-process principals. */
export const SYSTEM_PRINCIPALS = Object.freeze({
  decisionIntelligenceOptimization: Object.freeze({
    id: SystemPrincipalId.DecisionIntelligenceOptimization,
    type: IdentityType.Service,
    scopes: Object.freeze([ServiceScope.RouteAnalysisRead]),
  }),
}) satisfies Readonly<Record<string, SystemPrincipal>>;
