import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { CreateShipmentRequest } from "./shipment.http-contracts";
import {
  DimensionUnit,
  WeightUnit,
} from "../../../../shared/domain/shared-kernel/value-objects/measurement";
import { ShipmentHttpMapper } from "./shipment.http-mapper";

const request: CreateShipmentRequest = {
  pickup: {
    address: {
      country: "UA",
      city: "Kyiv",
      street: "Halytska",
      buildingNumber: "12",
      postalCode: "02000",
    },
    timeWindow: {
      start: "2026-08-10T08:00:00.000Z",
      end: "2026-08-10T10:00:00.000Z",
    },
  },
  delivery: {
    address: {
      country: "UA",
      city: "Lviv",
      street: "Horodotska",
      buildingNumber: "8",
      postalCode: "79000",
    },
    timeWindow: {
      start: "2026-08-10T14:00:00.000Z",
      end: "2026-08-10T16:00:00.000Z",
    },
  },
  weight: { value: 400, unit: WeightUnit.Kilogram },
  dimensions: {
    length: 200,
    width: 120,
    height: 150,
    unit: DimensionUnit.Centimeter,
  },
};

test("ShipmentHttpMapper converts transport time windows into dates", () => {
  const input = ShipmentHttpMapper.toShipmentDetailsInput(request);

  assert.ok(input.pickup.timeWindow.start instanceof Date);
  assert.equal(
    input.pickup.timeWindow.start.toISOString(),
    "2026-08-10T08:00:00.000Z",
  );
  assert.equal(
    input.delivery.timeWindow.end.toISOString(),
    "2026-08-10T16:00:00.000Z",
  );
  assert.equal(input.weight.value, 400);
  assert.equal(input.dimensions.unit, "CENTIMETER");
});

test("ShipmentHttpMapper maps a created shipment response", () => {
  assert.deepEqual(ShipmentHttpMapper.toCreatedShipmentResponse("shipment-id"), {
    id: "shipment-id",
  });
});