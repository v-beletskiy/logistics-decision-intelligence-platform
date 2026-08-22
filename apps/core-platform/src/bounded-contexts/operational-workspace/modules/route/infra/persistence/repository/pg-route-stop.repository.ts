import { Injectable } from "@nestjs/common";

import { ConcurrencyConflictException } from "../../../../../../../shared/app/app.exceptions";
import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import { RouteId } from "../../../domain/route-id";
import { RouteStopId } from "../../../domain/route-stop-id";
import {
  RouteStopRepository,
  type LoadedRouteStop,
} from "../../../domain/route-stop.repository";
import type { RouteStop } from "../../../domain/route-stop.aggregate";
import { RouteStopMapper } from "./mappers/route-stop.mapper";
import { findRouteStopById } from "./queries/route-stop.find-by-id.queries";
import { findRouteStopByRouteIdAndSequenceForUpdate } from "./queries/route-stop.find-by-route-id-and-sequence-for-update.queries";
import { findRouteStopByRouteIdAndSequence } from "./queries/route-stop.find-by-route-id-and-sequence.queries";
import { findRouteStopsByRouteId } from "./queries/route-stop.find-by-route-id.queries";
import { insertRouteStops } from "./queries/route-stop.insert-many.queries";
import { updateRouteStop } from "./queries/route-stop.update.queries";

@Injectable()
export class PgRouteStopRepository extends RouteStopRepository {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async findById(
    tenantId: string,
    id: RouteStopId,
  ): Promise<LoadedRouteStop | null> {
    const [row] = await this.database.exec(findRouteStopById, {
      tenantId,
      id: id.value,
    });
    return row
      ? {
          aggregate: RouteStopMapper.toDomain(row),
          expectedRevision: row.revision,
        }
      : null;
  }

  async findByRouteIdAndSequence(
    tenantId: string,
    routeId: RouteId,
    sequence: number,
  ): Promise<LoadedRouteStop | null> {
    const [row] = await this.database.exec(findRouteStopByRouteIdAndSequence, {
      tenantId,
      routeId: routeId.value,
      sequence,
    });
    return row
      ? {
          aggregate: RouteStopMapper.toDomain(row),
          expectedRevision: row.revision,
        }
      : null;
  }

  async findAllByRouteId(
    tenantId: string,
    routeId: RouteId,
  ): Promise<readonly LoadedRouteStop[]> {
    const rows = await this.database.exec(findRouteStopsByRouteId, {
      tenantId,
      routeId: routeId.value,
    });
    return rows.map((row) => ({
      aggregate: RouteStopMapper.toDomain(row),
      expectedRevision: row.revision,
    }));
  }

  async findByRouteIdAndSequenceForUpdate(
    tenantId: string,
    routeId: RouteId,
    sequence: number,
  ): Promise<LoadedRouteStop | null> {
    const [row] = await this.database.exec(
      findRouteStopByRouteIdAndSequenceForUpdate,
      { tenantId, routeId: routeId.value, sequence },
    );
    return row
      ? {
          aggregate: RouteStopMapper.toDomain(row),
          expectedRevision: row.revision,
        }
      : null;
  }

  async addMany(tenantId: string, stops: readonly RouteStop[]): Promise<void> {
    if (stops.length === 0) return;
    await this.database.exec(insertRouteStops, {
      rows: stops.map((stop) => RouteStopMapper.toPersistence(tenantId, stop)),
    });
  }

  async save(
    tenantId: string,
    loadedRouteStop: LoadedRouteStop,
  ): Promise<string> {
    const [row] = await this.database.exec(updateRouteStop, {
      ...RouteStopMapper.toPersistence(tenantId, loadedRouteStop.aggregate),
      expectedRevision: loadedRouteStop.expectedRevision,
    });
    if (!row) {
      throw new ConcurrencyConflictException(
        "Route stop was changed or removed by another operation.",
      );
    }
    return row.revision;
  }
}
