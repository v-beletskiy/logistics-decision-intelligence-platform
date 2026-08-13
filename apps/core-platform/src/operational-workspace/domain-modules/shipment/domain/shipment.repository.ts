import type { Shipment } from "./shipment.aggregate";
import type { ShipmentId } from "./shipment-id";

export abstract class ShipmentRepository {
  abstract findById(tenantId: string, id: ShipmentId): Promise<Shipment | null>;
  abstract findByIds(
    tenantId: string,
    ids: readonly ShipmentId[],
  ): Promise<readonly Shipment[]>;
  abstract save(tenantId: string, shipment: Shipment): Promise<void>;
  abstract delete(tenantId: string, id: ShipmentId): Promise<void>;
}
