import { Injectable } from "@nestjs/common";

import { ConcurrencyConflictException } from "../../../../../../shared/app/app.exceptions";
import { PgDatabase } from "../../../../../../shared/infra/persistence/pg-database";
import { Depot } from "../../../domain/depot.aggregate";
import { DepotId } from "../../../domain/depot-id";
import {
  DepotRepository,
  type LoadedDepot,
} from "../../../domain/depot.repository";
import { DepotMapper } from "./mappers/depot.mapper";
import { findDepotById } from "./queries/depot.find-by-id.queries";
import { findDepots } from "./queries/depot.find.queries";
import { insertDepot } from "./queries/depot.insert.queries";
import { updateDepot } from "./queries/depot.update.queries";

@Injectable()
export class PgDepotRepository extends DepotRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(tenantId: string, id: DepotId): Promise<LoadedDepot | null> {
    const [row] = await this.database.exec(findDepotById, {
      tenantId,
      id: id.value,
    });
    return row
      ? { aggregate: DepotMapper.toDomain(row), expectedRevision: row.revision }
      : null;
  }

  async find(tenantId: string): Promise<readonly Depot[]> {
    const rows = await this.database.exec(findDepots, { tenantId });
    return rows.map((row) => DepotMapper.toDomain(row));
  }

  async add(tenantId: string, depot: Depot): Promise<void> {
    await this.database.exec(insertDepot, DepotMapper.toPersistence(tenantId, depot));
  }

  async save(tenantId: string, loadedDepot: LoadedDepot): Promise<string> {
    const [row] = await this.database.exec(updateDepot, {
      ...DepotMapper.toPersistence(tenantId, loadedDepot.aggregate),
      expectedRevision: loadedDepot.expectedRevision,
    });
    if (!row) {
      throw new ConcurrencyConflictException(
        "Depot was changed or removed by another operation.",
      );
    }
    return row.revision;
  }
}
