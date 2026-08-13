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

@Injectable()
export class PgShipmentRepository extends ShipmentRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(tenantId: string, id: ShipmentId): Promise<Shipment | null> {
    const [row] = await this.database.exec(findShipmentById, {
      tenantId,
      id: id.value,
    });
    return row
      ? ShipmentMapper.toDomain(row)
      : null;
  }

  async findByIds(
    tenantId: string,
    ids: readonly ShipmentId[],
  ): Promise<readonly Shipment[]> {
    if (ids.length === 0) return [];
    const rows = await this.database.exec(findShipmentsByIds, {
      tenantId,
      ids: ids.map((id) => id.value),
    });
    return rows.map((row) =>
      ShipmentMapper.toDomain(row),
    );
  }

  async save(tenantId: string, shipment: Shipment): Promise<void> {
    const persistence = ShipmentMapper.toPersistence(tenantId, shipment);
    await persistRoot(this.database, persistence.isNew, {
      insertStatement: insertShipment,
      updateStatement: updateShipment,
      params: persistence.root,
    });
  }

  async delete(tenantId: string, id: ShipmentId): Promise<void> {
    await this.database.exec(deleteShipment, { tenantId, id: id.value });
  }
}
