import { Injectable } from "@nestjs/common";

import { persistRoot } from "../../../../../shared/infra/persistence/orm/pg-persist-changes";
import { PgDatabase } from "../../../../../shared/infra/persistence/pg-database";
import { Depot } from "../../domain/depot.aggregate";
import { DepotId } from "../../domain/depot-id";
import { DepotRepository } from "../../domain/depot.repository";
import { deleteDepot } from "./queries/depot.delete.queries";
import { findDepots } from "./queries/depot.find.queries";
import { findDepotById } from "./queries/depot.find-by-id.queries";
import { insertDepot } from "./queries/depot.insert.queries";
import { updateDepot } from "./queries/depot.update.queries";
import { DepotMapper } from "./depot.mapper";
import type { DepotEntity } from "./entities/depot.entity";

@Injectable()
export class PgDepotRepository extends DepotRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(id: DepotId): Promise<Depot | null> {
    const [row] = await this.database.exec(findDepotById, { id: id.value });
    return row ? DepotMapper.toDomain(row as unknown as DepotEntity) : null;
  }

  async find(): Promise<readonly Depot[]> {
    const rows = await this.database.exec(findDepots, undefined);
    return rows.map((row) =>
      DepotMapper.toDomain(row as unknown as DepotEntity),
    );
  }

  async save(depot: Depot): Promise<void> {
    const persistence = DepotMapper.toPersistence(depot);
    await persistRoot(this.database, persistence.isNew, {
      insertStatement: insertDepot,
      updateStatement: updateDepot,
      params: persistence.root,
    });
  }

  async delete(id: DepotId): Promise<void> {
    await this.database.exec(deleteDepot, { id: id.value });
  }
}
