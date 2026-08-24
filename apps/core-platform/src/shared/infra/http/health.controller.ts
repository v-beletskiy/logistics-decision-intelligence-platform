import {
  Controller,
  Get,
  ServiceUnavailableException,
  VERSION_NEUTRAL,
} from "@nestjs/common";

import { PgDatabase } from "../persistence/pg-database.js";
import { PublicRoute } from "../../modules/access-control/infra/authentication/public-route.decorator.js";

export interface HealthResponse {
  readonly status: "live" | "ready";
}

@Controller({ path: "health", version: VERSION_NEUTRAL })
@PublicRoute()
export class HealthController {
  constructor(private readonly database: PgDatabase) {}

  @Get("live")
  live(): HealthResponse {
    return { status: "live" };
  }

  @Get("ready")
  async ready(): Promise<HealthResponse> {
    try {
      await this.database.query("SELECT 1");
      return { status: "ready" };
    } catch {
      throw new ServiceUnavailableException("Database is unavailable.");
    }
  }
}
