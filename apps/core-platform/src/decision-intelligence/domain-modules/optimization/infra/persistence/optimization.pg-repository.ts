import { Injectable } from '@nestjs/common';

import { OptimizationRepository } from '../../domain/optimization.repository';

@Injectable()
export class PgOptimizationRepository extends OptimizationRepository {}
