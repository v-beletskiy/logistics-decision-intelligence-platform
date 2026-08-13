import type { Depot } from "./depot.aggregate";
import type { DepotId } from "./depot-id";

export abstract class DepotRepository {
  abstract findById(tenantId: string, id: DepotId): Promise<Depot | null>;
  abstract find(tenantId: string): Promise<readonly Depot[]>;
  abstract save(tenantId: string, depot: Depot): Promise<void>;
  abstract delete(tenantId: string, id: DepotId): Promise<void>;
}
