import type { Shipment } from "./shipment.aggregate";
import type { ShipmentId } from "./shipment-id";

export abstract class ShipmentRepository {
  abstract findById(id: ShipmentId): Promise<Shipment | null>;
  abstract findByIds(ids: readonly string[]): Promise<readonly Shipment[]>;
  abstract save(shipment: Shipment): Promise<void>;
  abstract delete(id: ShipmentId): Promise<void>;
}
