import type {
  ServiceDefinition,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import { Injectable } from "@nestjs/common";

export interface GrpcServiceRegistration {
  readonly service: ServiceDefinition;
  readonly implementation: UntypedServiceImplementation;
}

/** Collects gRPC services contributed by bounded contexts for the global server. */
@Injectable()
export class GrpcServiceRegistry {
  private readonly registrations: GrpcServiceRegistration[] = [];

  register(
    service: ServiceDefinition,
    implementation: UntypedServiceImplementation,
  ): void {
    this.registrations.push({ service, implementation });
  }

  getAll(): readonly GrpcServiceRegistration[] {
    return this.registrations;
  }
}
