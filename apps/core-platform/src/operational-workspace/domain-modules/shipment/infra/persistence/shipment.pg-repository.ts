import { Injectable } from '@nestjs/common';

import { ShipmentRepository } from '../../domain/shipment.repository';

@Injectable()
export class PgShipmentRepository extends ShipmentRepository {}
