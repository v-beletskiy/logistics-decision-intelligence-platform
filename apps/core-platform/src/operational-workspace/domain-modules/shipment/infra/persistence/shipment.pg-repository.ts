import { Injectable } from '@nestjs/common';

import { ShipmentRepository } from '../../domain/shipment.repository';

@Injectable()
export class PgShipmentRepository extends ShipmentRepository {
  async findByIds(ids: readonly string[]): Promise<readonly unknown[]> {
    void ids;
    throw new Error("Shipment persistence is not implemented.");
  }
}
