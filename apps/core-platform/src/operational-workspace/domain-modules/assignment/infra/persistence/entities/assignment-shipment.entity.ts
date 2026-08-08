/** Persisted assignment-shipment child row. */
export interface AssignmentShipmentEntity {
  readonly id: string;
  readonly shipmentId: string;
  readonly weight: number;
  readonly weightUnit: string;
  readonly length: number;
  readonly width: number;
  readonly height: number;
  readonly dimensionUnit: string;
}
