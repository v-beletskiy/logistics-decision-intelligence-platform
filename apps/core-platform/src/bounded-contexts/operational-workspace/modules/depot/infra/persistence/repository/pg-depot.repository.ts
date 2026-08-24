import { Injectable } from "@nestjs/common";

import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import { execRevisionedPgUpdate } from "../../../../../../../shared/infra/persistence/pg-repository-write.js";
import { Depot } from "../../../domain/depot.aggregate.js";
import { DepotId } from "../../../domain/depot-id.js";
import {
  DepotRepository,
  type LoadedDepot,
} from "../../../domain/depot.repository.js";
import { DepotMapper } from "./mappers/depot.mapper.js";
import { findDepotById } from "./queries/depot.find-by-id.queries.js";
import { findDepots } from "./queries/depot.find.queries.js";
import { insertDepot } from "./queries/depot.insert.queries.js";
import { updateDepot } from "./queries/depot.update.queries.js";

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
    await this.database.exec(
      insertDepot,
      DepotMapper.toPersistence(tenantId, depot),
    );
  }

  async save(tenantId: string, loadedDepot: LoadedDepot): Promise<string> {
    return execRevisionedPgUpdate({
      database: this.database,
      statement: updateDepot,
      params: {
        ...DepotMapper.toPersistence(tenantId, loadedDepot.aggregate),
        expectedRevision: loadedDepot.expectedRevision,
      },
      options: { aggregateName: "Depot" },
    });
  }
}
