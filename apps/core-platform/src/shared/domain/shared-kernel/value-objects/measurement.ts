export enum WeightUnit {
  Kilogram = 'KILOGRAM',
  Gram = 'GRAM',
  Pound = 'POUND',
}

export interface Weight {
  readonly value: number;
  readonly unit: WeightUnit;
}

export enum VolumeUnit {
  CubicMeter = 'CUBIC_METER',
  CubicFoot = 'CUBIC_FOOT',
  Liter = 'LITER',
}

export interface Volume {
  readonly value: number;
  readonly unit: VolumeUnit;
}

export enum DimensionUnit {
  Centimeter = 'CENTIMETER',
  Millimeter = 'MILLIMETER',
  Inch = 'INCH',
}

export interface Dimensions {
  readonly length: number;
  readonly width: number;
  readonly height: number;
  readonly unit: DimensionUnit;
}

export enum DistanceUnit {
  Kilometer = 'KILOMETER',
  Mile = 'MILE',
}

export interface Distance {
  readonly value: number;
  readonly unit: DistanceUnit;
}
