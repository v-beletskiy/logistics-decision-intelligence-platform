import { Module } from '@nestjs/common';

import { RouteRepository } from '../../domain/route.repository';
import { PgRouteRepository } from './route.pg-repository';

@Module({
  providers: [
    {
      provide: RouteRepository,
      useClass: PgRouteRepository,
    },
  ],
  exports: [RouteRepository],
})
export class RoutePersistenceModule {}
