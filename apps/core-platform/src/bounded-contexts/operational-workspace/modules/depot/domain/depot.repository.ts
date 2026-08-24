import type { Depot } from "./depot.aggregate.js";
import type { DepotId } from "./depot-id.js";

export interface LoadedDepot {
  readonly aggregate: Depot;
  readonly expectedRevision: string;
}

export abstract class DepotRepository {
  abstract findById(tenantId: string, id: DepotId): Promise<LoadedDepot | null>;
  abstract find(tenantId: string): Promise<readonly Depot[]>;
  abstract add(tenantId: string, depot: Depot): Promise<void>;
  abstract save(tenantId: string, loadedDepot: LoadedDepot): Promise<string>;
}
