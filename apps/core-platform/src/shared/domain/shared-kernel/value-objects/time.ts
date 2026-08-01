export interface TimeWindow {
  readonly start: Date;
  readonly end: Date;
}

export interface Schedule {
  readonly arrivalTime: Date;
  readonly departureTime: Date;
}

export interface Duration {
  readonly value: number;
  readonly unit: DurationUnit;
}
export enum DurationUnit {
  Hour = 'HOUR',
  Minute = 'MINUTE',
  Second = 'SECOND',
}
