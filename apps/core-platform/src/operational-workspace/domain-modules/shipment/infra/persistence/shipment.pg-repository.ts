import { Injectable } from "@nestjs/common";

import { persistRoot } from "../../../../../shared/infra/persistence/orm/pg-persist-changes";
import { PgDatabase } from "../../../../../shared/infra/persistence/pg-database";
import { Shipment } from "../../domain/shipment.aggregate";
import { ShipmentId } from "../../domain/shipment-id";
import { ShipmentRepository } from "../../domain/shipment.repository";
import { deleteShipment } from "./queries/shipment.delete.queries";
import { findShipmentById } from "./queries/shipment.find-by-id.queries";
import { findShipmentsByIds } from "./queries/shipment.find-by-ids.queries";
import { insertShipment } from "./queries/shipment.insert.queries";
import { updateShipment } from "./queries/shipment.update.queries";
import { ShipmentMapper } from "./shipment.mapper";
import type { ShipmentEntity } from "./entities/shipment.entity";

@Injectable()
export class PgShipmentRepository extends ShipmentRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(id: ShipmentId): Promise<Shipment | null> {
    const [row] = await this.database.exec(findShipmentById, { id: id.value });
    return row
      ? ShipmentMapper.toDomain(row as unknown as ShipmentEntity)
      : null;
  }

  async findByIds(ids: readonly ShipmentId[]): Promise<readonly Shipment[]> {
    if (ids.length === 0) return [];
    const rows = await this.database.exec(findShipmentsByIds, {
      ids: ids.map((id) => id.value),
    });
    return rows.map((row) =>
      ShipmentMapper.toDomain(row as unknown as ShipmentEntity),
    );
  }

  async save(shipment: Shipment): Promise<void> {
    const persistence = ShipmentMapper.toPersistence(shipment);
    await persistRoot(this.database, persistence.isNew, {
      insertStatement: insertShipment,
      updateStatement: updateShipment,
      params: persistence.root,
    });
  }

  async delete(id: ShipmentId): Promise<void> {
    await this.database.exec(deleteShipment, { id: id.value });
  }
}
