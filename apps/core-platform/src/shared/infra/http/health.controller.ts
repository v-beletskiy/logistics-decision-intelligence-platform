import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";

import { PgDatabase } from "../persistence/pg-database";

export interface HealthResponse {
  readonly status: "live" | "ready";
}

@Controller("health")
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
