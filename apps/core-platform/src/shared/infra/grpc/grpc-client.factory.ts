import { Injectable } from "@nestjs/common";
import * as grpc from "@grpc/grpc-js";

export interface GrpcClientConstructor<TClient> {
  new (
    address: string,
    credentials: grpc.ChannelCredentials,
    options?: grpc.ClientOptions,
  ): TClient;
}

export interface GrpcClientConnection {
  readonly target: string;
  readonly credentials: grpc.ChannelCredentials;
  readonly channelOptions?: grpc.ClientOptions;
}

/**
 * Creates generated gRPC clients from connection details supplied by a
 * context-owned infrastructure adapter. This factory deliberately has no
 * knowledge of a particular remote service, authentication mechanism, or RPC.
 */
@Injectable()
export class GrpcClientFactory {
  createClient<TClient>(
    Client: GrpcClientConstructor<TClient>,
    connection: GrpcClientConnection,
  ): TClient {
    return new Client(
      connection.target,
      connection.credentials,
      connection.channelOptions,
    );
  }
}
