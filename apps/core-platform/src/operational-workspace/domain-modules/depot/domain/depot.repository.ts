import type { Depot } from "./depot.aggregate";
import type { DepotId } from "./depot-id";

export abstract class DepotRepository {
  abstract findById(id: DepotId): Promise<Depot | null>;
  abstract find(): Promise<readonly Depot[]>;
  abstract save(depot: Depot): Promise<void>;
  abstract delete(id: DepotId): Promise<void>;
}
