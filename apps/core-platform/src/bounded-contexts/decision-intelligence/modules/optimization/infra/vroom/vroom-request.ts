export interface VroomJob {
  readonly id: number;
  readonly location: readonly [number, number];
  readonly location_index: number;
  readonly service?: number;
  readonly time_windows?: readonly (readonly [number, number])[];
}

export interface VroomShipment {
  readonly pickup: VroomJob;
  readonly delivery: VroomJob;
}

export interface VroomVehicle {
  readonly id: number;
  readonly profile: "car";
  readonly start: readonly [number, number];
  readonly start_index: number;
  readonly time_window: readonly [number, number];
}

export interface VroomMatrices {
  readonly car: {
    readonly durations: readonly (readonly number[])[];
    readonly distances: readonly (readonly number[])[];
  };
}

export interface VroomRequest {
  readonly jobs: readonly VroomJob[];
  readonly shipments: readonly VroomShipment[];
  readonly vehicles: readonly VroomVehicle[];
  readonly matrices: VroomMatrices;
  readonly options?: { readonly geometry?: boolean };
}
