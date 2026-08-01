import { Injectable } from '@nestjs/common';

import { DepotRepository } from '../../domain/depot.repository';

@Injectable()
export class PgDepotRepository extends DepotRepository {}
