import type { Depot } from "./depot.aggregate";
import type { DepotId } from "./depot-id";

export interface LoadedDepot {
  readonly aggregate: Depot;
  readonly expectedRevision: string;
}

export abstract class DepotRepository {
  abstract findById(
    tenantId: string,
    id: DepotId,
  ): Promise<LoadedDepot | null>;
  abstract find(tenantId: string): Promise<readonly Depot[]>;
  abstract add(tenantId: string, depot: Depot): Promise<void>;
  abstract save(tenantId: string, loadedDepot: LoadedDepot): Promise<string>;
}
