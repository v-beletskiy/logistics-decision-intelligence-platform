import {
  Server,
  ServerCredentials,
  status,
  type ServerUnaryCall,
  type UntypedServiceImplementation,
  type sendUnaryData,
} from "@grpc/grpc-js";
import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from "@nestjs/common";

import { APP_CONFIG, type ApiAppConfig } from "../config/app-config";
import { toGrpcStatus } from "./grpc-error-mapper";
import { GrpcServiceRegistry } from "./grpc-service-registry";

@Injectable()
export class GrpcServer
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(GrpcServer.name);
  private readonly server = new Server();

  constructor(
    @Inject(APP_CONFIG) private readonly config: ApiAppConfig,
    private readonly registry: GrpcServiceRegistry,
  ) {}

  onApplicationBootstrap(): void {
    for (const registration of this.registry.getAll()) {
      this.server.addService(
        registration.service,
        this.withErrorMapping(registration.implementation),
      );
    }

    this.server.bindAsync(
      `${this.config.grpc.host}:${this.config.grpc.port}`,
      ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          this.logger.error("Failed to start the gRPC server.", error.stack);
          return;
        }
        this.logger.log(
          `gRPC server listening on ${this.config.grpc.host}:${port}.`,
        );
      },
    );
  }

  onApplicationShutdown(): void {
    this.server.forceShutdown();
  }

  private withErrorMapping(
    implementation: UntypedServiceImplementation,
  ): UntypedServiceImplementation {
    const wrapped: UntypedServiceImplementation = {};
    for (const [name, handler] of Object.entries(implementation)) {
      wrapped[name] = (
        call: ServerUnaryCall<unknown, unknown>,
        callback: sendUnaryData<unknown>,
      ) => {
        try {
          const result = (handler as (...args: unknown[]) => unknown)(
            call,
            callback,
          );
          if (result instanceof Promise) {
            result.catch((error: unknown) => {
              this.completeWithError(callback, error);
            });
          }
        } catch (error) {
          this.completeWithError(callback, error);
        }
      };
    }
    return wrapped;
  }

  private completeWithError(
    callback: sendUnaryData<unknown>,
    error: unknown,
  ): void {
    const mapped = toGrpcStatus(error);
    if (mapped.code === status.INTERNAL) {
      this.logger.error(
        "Unhandled gRPC handler error.",
        error instanceof Error ? error.stack : undefined,
      );
    }
    callback(mapped, null);
  }
}
