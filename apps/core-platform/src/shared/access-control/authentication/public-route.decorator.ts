import { SetMetadata } from "@nestjs/common";

export const PUBLIC_ROUTE = Symbol("PUBLIC_ROUTE");

/** Explicitly opts an HTTP endpoint out of the deny-by-default JWT guard. */
export const PublicRoute = (): MethodDecorator & ClassDecorator =>
  SetMetadata(PUBLIC_ROUTE, true);
