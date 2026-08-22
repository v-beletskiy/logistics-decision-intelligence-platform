import * as assert from "node:assert/strict";
import { test } from "node:test";

import { USER_ERROR_CODES } from "../../bounded-contexts/administration/modules/user/domain/user-error-codes";
import { DECISION_INTELLIGENCE_ERROR_CODES } from "../../bounded-contexts/decision-intelligence/domain/decision-intelligence-error-codes";
import { OPTIMIZATION_ERROR_CODES } from "../../bounded-contexts/decision-intelligence/modules/optimization/domain/optimization-error-codes";
import { RECOMMENDATION_ERROR_CODES } from "../../bounded-contexts/decision-intelligence/modules/recommendation/domain/recommendation-error-codes";
import { ASSIGNMENT_ERROR_CODES } from "../../bounded-contexts/operational-workspace/modules/assignment/domain/assignment-error-codes";
import { DEPOT_ERROR_CODES } from "../../bounded-contexts/operational-workspace/modules/depot/domain/depot-error-codes";
import { DRIVER_ERROR_CODES } from "../../bounded-contexts/operational-workspace/modules/driver/domain/driver-error-codes";
import { ROUTE_ERROR_CODES } from "../../bounded-contexts/operational-workspace/modules/route/domain/route-error-codes";
import { SHIPMENT_ERROR_CODES } from "../../bounded-contexts/operational-workspace/modules/shipment/domain/shipment-error-codes";
import { VEHICLE_ERROR_CODES } from "../../bounded-contexts/operational-workspace/modules/vehicle/domain/vehicle-error-codes";
import { SHARED_DOMAIN_ERROR_CODES } from "./domain-error-codes";
import { defineErrorCodes } from "./domain.exceptions";

const catalogs = [
  SHARED_DOMAIN_ERROR_CODES,
  USER_ERROR_CODES,
  DECISION_INTELLIGENCE_ERROR_CODES,
  OPTIMIZATION_ERROR_CODES,
  RECOMMENDATION_ERROR_CODES,
  ASSIGNMENT_ERROR_CODES,
  DEPOT_ERROR_CODES,
  DRIVER_ERROR_CODES,
  ROUTE_ERROR_CODES,
  SHIPMENT_ERROR_CODES,
  VEHICLE_ERROR_CODES,
] as const;

test("domain error codes are globally unique and machine safe", () => {
  const codes = catalogs.flatMap((catalog) => Object.values(catalog));
  assert.equal(new Set(codes).size, codes.length);
  assert.ok(codes.every((code) => /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(code)));
});

test("error-code catalogs reject duplicate and malformed definitions", () => {
  assert.throws(() =>
    defineErrorCodes("test", { first: "duplicate", second: "duplicate" }),
  );
  assert.throws(() => defineErrorCodes("Test", { invalid: "valid" }));
});
