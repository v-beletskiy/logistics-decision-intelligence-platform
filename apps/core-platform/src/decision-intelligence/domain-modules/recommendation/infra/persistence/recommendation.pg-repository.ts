import { Injectable } from '@nestjs/common';

import { RecommendationRepository } from '../../domain/recommendation.repository';

@Injectable()
export class PgRecommendationRepository extends RecommendationRepository {}
