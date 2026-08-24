import * as assert from "node:assert/strict";
import { test } from "node:test";

import { ShipmentId } from "./shipment-id.js";

const shipmentId = "550e8400-e29b-41d4-a716-446655440000";

test("ShipmentId validates UUID values and preserves value equality", () => {
  const first = ShipmentId.from(shipmentId);
  const second = ShipmentId.from(shipmentId);

  assert.equal(first.value, shipmentId);
  assert.equal(first.equals(second), true);
  assert.throws(() => ShipmentId.from("shipment-1"), /valid UUID/);
});

test("ShipmentId creates UUIDv7 values", () => {
  const shipmentId = ShipmentId.generate();

  assert.match(
    shipmentId.value,
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
});
