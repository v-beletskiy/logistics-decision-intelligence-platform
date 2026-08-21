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

export interface VroomStep {
  readonly type:
    | "start"
    | "job"
    | "end"
    | "break"
    | "wait"
    | "pickup"
    | "delivery";
  readonly job?: number;
  readonly location?: readonly [number, number];
  readonly distance?: number;
  readonly duration?: number;
  readonly service?: number;
  readonly arrival?: number;
  readonly departure?: number;
}

export interface VroomRoute {
  readonly vehicle: number;
  readonly cost: number;
  readonly delivery?: readonly number[];
  readonly distance?: number;
  readonly duration?: number;
  readonly steps?: readonly VroomStep[];
}

export interface VroomSolution {
  readonly code: number;
  readonly unassigned?: readonly unknown[];
  readonly routes?: readonly VroomRoute[];
}
