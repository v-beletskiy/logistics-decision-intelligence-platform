import type { Draft07Schema } from "@logistics-decision-intelligence/validation/json-schema";

import { CompartmentType } from "../../../domain/compartment.entity.js";
import {
  DimensionUnit,
  VolumeUnit,
  WeightUnit,
} from "../../../../../../../shared/domain/value-objects/measurement/index.js";

export const vehicleDetailsRequestFields = {
  registrationNumber: { type: "string", minLength: 1, maxLength: 50 },
  name: { type: "string", minLength: 1, maxLength: 100 },
  depotId: { type: "string", format: "uuid" },
} as const satisfies NonNullable<Draft07Schema["properties"]>;

export const vehicleDetailsRequestRequiredFields = [
  "registrationNumber",
] as const satisfies readonly string[];

export const vehicleCapacityRequestFields = {
  maxWeight: {
    type: "object",
    additionalProperties: false,
    required: ["value", "unit"],
    properties: {
      value: { type: "number", minimum: 0 },
      unit: {
        type: "string",
        enum: [WeightUnit.Kilogram, WeightUnit.Gram, WeightUnit.Pound],
      },
    },
  },
  maxItemDimensions: {
    type: "object",
    additionalProperties: false,
    required: ["length", "width", "height", "unit"],
    properties: {
      length: { type: "number", exclusiveMinimum: 0 },
      width: { type: "number", exclusiveMinimum: 0 },
      height: { type: "number", exclusiveMinimum: 0 },
      unit: {
        type: "string",
        enum: [
          DimensionUnit.Meter,
          DimensionUnit.Centimeter,
          DimensionUnit.Millimeter,
          DimensionUnit.Inch,
        ],
      },
    },
  },
  maxVolume: {
    type: "object",
    additionalProperties: false,
    required: ["value", "unit"],
    properties: {
      value: { type: "number", minimum: 0 },
      unit: {
        type: "string",
        enum: [VolumeUnit.CubicMeter, VolumeUnit.CubicFoot, VolumeUnit.Liter],
      },
    },
  },
} as const satisfies NonNullable<Draft07Schema["properties"]>;

export const vehicleCompartmentRequestFields = {
  type: {
    type: "string",
    enum: [
      CompartmentType.DryCargo,
      CompartmentType.Refrigerated,
      CompartmentType.Frozen,
      CompartmentType.Hazardous,
    ],
  },
  name: { type: "string", minLength: 1, maxLength: 100 },
  capacity: {
    type: "object",
    additionalProperties: false,
    required: ["maxWeight", "maxItemDimensions", "maxVolume"],
    properties: vehicleCapacityRequestFields,
  },
} as const satisfies NonNullable<Draft07Schema["properties"]>;

export const vehicleCompartmentRequestRequiredFields = [
  "type",
  "capacity",
] as const satisfies readonly string[];
