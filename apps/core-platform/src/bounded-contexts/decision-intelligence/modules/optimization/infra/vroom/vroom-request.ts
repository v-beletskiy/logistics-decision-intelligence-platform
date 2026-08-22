export interface VroomJob {
  readonly id: number;
  readonly location: readonly [number, number];
  readonly service?: number;
  readonly timeWindows?: readonly (readonly [number, number])[];
}

export interface VroomVehicle {
  readonly id: number;
  readonly start?: readonly [number, number];
  readonly end?: readonly [number, number];
}

export interface VroomRequest {
  readonly jobs: readonly VroomJob[];
  readonly vehicles: readonly VroomVehicle[];
  readonly options?: { readonly geometry?: boolean };
}
