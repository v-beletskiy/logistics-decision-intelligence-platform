import { Injectable } from '@nestjs/common';

import { AssignmentRepository } from '../../domain/assignment.repository';

@Injectable()
export class PgAssignmentRepository extends AssignmentRepository {}
