export interface GeoCoordinate {
  readonly latitude: number;
  readonly longitude: number;
}

export interface Address {
  readonly country: string;
  readonly stateOrRegion?: string;
  readonly city: string;
  readonly street: string;
  readonly buildingNumber: string;
  readonly postalCode: string;
}
