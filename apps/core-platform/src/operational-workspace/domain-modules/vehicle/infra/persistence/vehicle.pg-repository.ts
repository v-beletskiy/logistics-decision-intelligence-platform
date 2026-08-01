import { Injectable } from '@nestjs/common';

import { VehicleRepository } from '../../domain/vehicle.repository';

@Injectable()
export class PgVehicleRepository extends VehicleRepository {}
