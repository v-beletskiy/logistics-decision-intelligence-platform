import { Injectable } from '@nestjs/common';

import { RouteRepository } from '../../domain/route.repository';

@Injectable()
export class PgRouteRepository extends RouteRepository {}
