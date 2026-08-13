import { Injectable } from "@nestjs/common";

import { ConcurrencyConflictException } from "../../../../../../shared/app/exceptions/concurrency-conflict.exception";
import { PgDatabase } from "../../../../../../shared/infra/persistence/pg-database";
import { Shipment } from "../../../domain/shipment.aggregate";
import { ShipmentId } from "../../../domain/shipment-id";
import {
  ShipmentRepository,
  type LoadedShipment,
} from "../../../domain/shipment.repository";
import { ShipmentMapper } from "./mappers/shipment.mapper";
import { findShipmentById } from "./queries/shipment.find-by-id.queries";
import { findShipmentsByIds } from "./queries/shipment.find-by-ids.queries";
import { insertShipment } from "./queries/shipment.insert.queries";
import { updateShipment } from "./queries/shipment.update.queries";

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
    const [row] = await this.database.exec(updateShipment, {
      ...ShipmentMapper.toPersistence(tenantId, loadedShipment.aggregate),
      expectedRevision: loadedShipment.expectedRevision,
    });
    if (!row) {
      throw new ConcurrencyConflictException(
        "Shipment was changed or removed by another operation.",
      );
    }
    return row.revision;
  }
}
