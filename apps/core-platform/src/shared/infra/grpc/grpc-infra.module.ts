import { Global, Module } from "@nestjs/common";

import { GrpcClientFactory } from "./grpc-client.factory";
import { GrpcServer } from "./grpc-server";
import { GrpcServiceRegistry } from "./grpc-service-registry";

@Global()
@Module({
  providers: [GrpcClientFactory, GrpcServiceRegistry, GrpcServer],
  exports: [GrpcClientFactory, GrpcServiceRegistry, GrpcServer],
})
export class GrpcInfraModule {}
