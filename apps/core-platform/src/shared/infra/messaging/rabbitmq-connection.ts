import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
} from "@nestjs/common";
import amqp, {
  type Channel,
  type ChannelModel,
  type ConfirmChannel,
} from "amqplib";

import { APP_CONFIG, type AppConfig } from "../config/app-config";

/** Owns only the physical AMQP connection and creates caller-owned channels. */
@Injectable()
export class RabbitMqConnection implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqConnection.name);
  private connection?: ChannelModel;
  private initializing?: Promise<ChannelModel>; // to protect from probable double-initialization
  private destroyed = false;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async createChannel(): Promise<Channel> {
    return (await this.getConnection()).createChannel();
  }

  async createConfirmChannel(): Promise<ConfirmChannel> {
    return (await this.getConnection()).createConfirmChannel();
  }

  async onModuleDestroy(): Promise<void> {
    this.destroyed = true;
    const initializing = this.initializing;
    let connection = this.connection;
    this.connection = undefined;
    this.initializing = undefined;

    if (connection === undefined && initializing !== undefined) {
      connection = await initializing.catch(() => undefined);
    }
    await connection?.close();
  }

  private async getConnection(): Promise<ChannelModel> {
    if (this.destroyed) {
      throw new Error("RabbitMQ connection is shutting down.");
    }
    if (this.connection !== undefined) {
      return this.connection;
    }

    const initializing = this.initializing ?? this.initialize();
    this.initializing = initializing;
    try {
      return await initializing;
    } finally {
      if (this.initializing === initializing) {
        this.initializing = undefined;
      }
    }
  }

  private async initialize(): Promise<ChannelModel> {
    const connection = await amqp.connect(this.config.messaging.rabbitMqUrl);
    if (this.destroyed) {
      await connection.close();
      throw new Error("RabbitMQ connection was opened during shutdown.");
    }

    connection.on("error", (error: Error) => {
      this.logger.error("RabbitMQ connection error.", error.stack);
    });
    connection.once("close", () => {
      if (this.connection === connection) {
        this.connection = undefined;
      }
    });
    this.connection = connection;
    return connection;
  }
}
