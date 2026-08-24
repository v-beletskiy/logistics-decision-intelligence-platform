import { Injectable, type OnModuleInit } from "@nestjs/common";

import type { WorkerAppConfig } from "../../../config/app-config.js";

/**
 * Base for background-job consumers: subscribes only when running in the
 * worker process role, so the role check lives in one place.
 */
@Injectable()
export abstract class IntegrationJobWorker implements OnModuleInit {
  protected constructor(protected readonly config: WorkerAppConfig) {}

  async onModuleInit(): Promise<void> {
    await this.subscribe();
  }

  protected abstract subscribe(): Promise<void>;
}
