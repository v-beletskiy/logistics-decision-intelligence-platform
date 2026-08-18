import type { DepotDetails } from "../../domain-modules/depot/domain/depot.aggregate";

export interface DepotDetailsInput
  extends Pick<DepotDetails, "name" | "address" | "location"> {}
