import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Duration, DurationUnit, Schedule, TimeWindow } from ".";

test("Duration validates its value and unit", () => {
  const duration = Duration.create({ value: 30, unit: DurationUnit.Minute });

  assert.ok(
    duration.equals(Duration.create({ value: 30, unit: DurationUnit.Minute })),
  );
  assert.throws(
    () => Duration.create({ value: -1, unit: DurationUnit.Minute }),
    /cannot be negative/,
  );
});

test("TimeWindow and Schedule protect their date invariants and date immutability", () => {
  const start = new Date("2026-08-05T08:00:00.000Z");
  const end = new Date("2026-08-05T09:00:00.000Z");
  const window = TimeWindow.create({ start, end });
  const schedule = Schedule.create({ arrivalTime: start, departureTime: end });

  start.setUTCFullYear(1999);
  schedule.arrivalTime.setUTCFullYear(1998);

  assert.equal(window.start.getUTCFullYear(), 2026);
  assert.equal(schedule.arrivalTime.getUTCFullYear(), 2026);
  assert.throws(
    () =>
      TimeWindow.create({
        start: end,
        end: new Date("2026-08-05T08:00:00.000Z"),
      }),
    /cannot be later/,
  );
  assert.throws(
    () => Schedule.create({ arrivalTime: start, departureTime: start }),
    /must be before departure time/,
  );
});
