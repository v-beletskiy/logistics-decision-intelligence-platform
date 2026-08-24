import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import { execRevisionedPgUpdate } from "../../../../../../../shared/infra/persistence/pg-repository-write.js";
import { Shipment } from "../../../domain/shipment.aggregate.js";
import { ShipmentId } from "../../../domain/shipment-id.js";
import {
  ShipmentRepository,
  type LoadedShipment,
} from "../../../domain/shipment.repository.js";
import { ShipmentMapper } from "./mappers/shipment.mapper.js";
import { findShipmentById } from "./queries/shipment.find-by-id.queries.js";
import { findShipmentsByIds } from "./queries/shipment.find-by-ids.queries.js";
import { insertShipment } from "./queries/shipment.insert.queries.js";
import { updateShipment } from "./queries/shipment.update.queries.js";

@Injectable()
export class PgShipmentRepository extends ShipmentRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(
    tenantId: string,
    id: ShipmentId,
  ): Promise<LoadedShipment | null> {
    const [row] = await this.database.exec(findShipmentById, {
      tenantId,
      id: id.value,
    });
    return row
      ? {
          aggregate: ShipmentMapper.toDomain(row),
          expectedRevision: row.revision,
        }
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
    return rows.map((row) => ShipmentMapper.toDomain(row));
  }

  async add(tenantId: string, shipment: Shipment): Promise<void> {
    await this.database.exec(
      insertShipment,
      ShipmentMapper.toPersistence(tenantId, shipment),
    );
  }

  async save(
    tenantId: string,
    loadedShipment: LoadedShipment,
  ): Promise<string> {
    return execRevisionedPgUpdate({
      database: this.database,
      statement: updateShipment,
      params: {
        ...ShipmentMapper.toPersistence(tenantId, loadedShipment.aggregate),
        expectedRevision: loadedShipment.expectedRevision,
      },
      options: { aggregateName: "Shipment" },
    });
  }
}
