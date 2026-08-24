import { Global, Module } from "@nestjs/common";

import { GrpcClientFactory } from "./grpc-client.factory.js";
import { GrpcServer } from "./grpc-server.js";
import { GrpcServiceRegistry } from "./grpc-service-registry.js";

@Global()
@Module({
  providers: [GrpcClientFactory, GrpcServiceRegistry, GrpcServer],
  exports: [GrpcClientFactory, GrpcServiceRegistry, GrpcServer],
})
export class GrpcInfraModule {}
