/**
 * Domain-owned repository token for the Shipment aggregate.
 */
export abstract class ShipmentRepository {
  abstract findByIds(ids: readonly string[]): Promise<readonly unknown[]>;
}
