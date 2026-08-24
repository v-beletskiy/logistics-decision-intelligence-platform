import type { Shipment } from "./shipment.aggregate.js";
import type { ShipmentId } from "./shipment-id.js";

export interface LoadedShipment {
  readonly aggregate: Shipment;
  readonly expectedRevision: string;
}

export abstract class ShipmentRepository {
  abstract findById(
    tenantId: string,
    id: ShipmentId,
  ): Promise<LoadedShipment | null>;
  abstract findByIds(
    tenantId: string,
    ids: readonly ShipmentId[],
  ): Promise<readonly Shipment[]>;
  abstract add(tenantId: string, shipment: Shipment): Promise<void>;
  abstract save(
    tenantId: string,
    loadedShipment: LoadedShipment,
  ): Promise<string>;
}
