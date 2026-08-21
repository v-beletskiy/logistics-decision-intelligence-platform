import { Injectable, type OnModuleInit } from "@nestjs/common";

import type { AppConfig } from "../../../config/app-config";

/**
 * Base for background-job consumers: subscribes only when running in the
 * worker process role, so the role check lives in one place.
 */
@Injectable()
export abstract class IntegrationJobWorker implements OnModuleInit {
  protected constructor(protected readonly config: AppConfig) {}

  async onModuleInit(): Promise<void> {
    if (!this.config.processRoles.includes("worker")) {
      return;
    }
    await this.subscribe();
  }

  protected abstract subscribe(): Promise<void>;
}