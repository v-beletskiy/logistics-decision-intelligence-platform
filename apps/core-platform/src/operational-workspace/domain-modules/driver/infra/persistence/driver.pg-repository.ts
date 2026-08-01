import { Injectable } from '@nestjs/common';

import { DriverRepository } from '../../domain/driver.repository';

@Injectable()
export class PgDriverRepository extends DriverRepository {}
