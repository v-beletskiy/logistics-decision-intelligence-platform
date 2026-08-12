import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { IDatabaseConnection } from "@pgtyped/runtime";

import type { PgDatabase } from "../../../../../../shared/infra/persistence/pg-database";
import type {
  DriverCursorSort,
  DriverPageSort,
} from "../../../../../app/driver/queries/search-drivers/driver-search";
import { DriverStatus } from "../../../domain/driver.aggregate";
import {
  searchDriversCursor,
  searchDriversPage,
} from "./queries/driver.search.queries";
import { PgDriverReadStore } from "./driver.pg-read-store";

const tenantId = "00000000-0000-4000-8000-000000000010";
const nameCursorSort: DriverCursorSort = {
  by: "name",
  direction: "asc",
};
const mixedNamePageSort: DriverPageSort = {
  by: "name",
  lastNameDirection: "asc",
  firstNameDirection: "desc",
};
const idCursorSort: DriverCursorSort = { by: "id", direction: "asc" };

function row(id: string, lastName: string) {
  return {
    id,
    first_name: "Alex",
    last_name: lastName,
    license_number: `LICENSE-${id.at(-1)}`,
    depot_id: null,
    phone_number: null,
    status: "AVAILABLE",
    certifications: [
      {
        id: `00000000-0000-4000-8000-00000000002${id.at(-1)}`,
        type: "HAZMAT",
        credentialNumber: `HZ-${id.at(-1)}`,
        validFrom: "2026-01-01T00:00:00.000Z",
        validUntil: "2027-01-01T00:00:00.000Z",
      },
    ],
  };
}

function databaseWithRows(): {
  readonly database: PgDatabase;
  readonly calls: Array<{ statement: unknown; params: unknown }>;
} {
  const calls: Array<{ statement: unknown; params: unknown }> = [];
  const rows = [
    row("00000000-0000-4000-8000-000000000001", "Adams"),
    row("00000000-0000-4000-8000-000000000002", "Baker"),
    row("00000000-0000-4000-8000-000000000003", "Clark"),
  ];
  return {
    calls,
    database: {
      exec: async (statement: unknown, params: unknown) => {
        calls.push({ statement, params });
        if (statement === searchDriversPage) {
          return rows.map((driver) => ({ ...driver, totalItems: 7 }));
        }
        if (statement === searchDriversCursor) return rows;
        return [];
      },
    } as unknown as PgDatabase,
  };
}

test("page pagination maps independent name directions and total metadata", async () => {
  const { database, calls } = databaseWithRows();
  const result = await new PgDriverReadStore(database).search(
    {
      tenantId,
      status: DriverStatus.Available,
      certificationType: "HAZMAT",
    },
    {
      mode: "page",
      page: 2,
      pageSize: 2,
      sort: mixedNamePageSort,
    },
  );

  assert.equal(result.mode, "page");
  if (result.mode !== "page") return;
  assert.equal(result.totalItems, 7);
  assert.equal(result.totalPages, 4);
  assert.equal(result.items[0]?.certifications[0]?.type, "HAZMAT");
  const search = calls.find((call) => call.statement === searchDriversPage);
  assert.deepEqual(search?.params, {
    tenantId,
    status: DriverStatus.Available,
    certificationType: "HAZMAT",
    sortBy: "name",
    lastNameDirection: "asc",
    firstNameDirection: "desc",
    idDirection: "desc",
    offset: 2,
    limit: 2,
  });
});

test("cursor pagination emits a criteria-bound tuple position and applies it", async () => {
  const fixture = databaseWithRows();
  const store = new PgDriverReadStore(fixture.database);
  const first = await store.search(
    { tenantId, status: DriverStatus.Available },
    {
      mode: "cursor",
      pageSize: 2,
      sort: nameCursorSort,
    },
  );
  assert.equal(first.mode, "cursor");
  if (first.mode !== "cursor" || !first.nextCursor) return;
  assert.equal(first.items.length, 2);

  const firstSearch = fixture.calls.find(
    (call) => call.statement === searchDriversCursor,
  );
  assert.deepEqual(firstSearch?.params, {
    tenantId,
    status: DriverStatus.Available,
    sortBy: "name",
    direction: "asc",
    afterLastName: undefined,
    afterFirstName: undefined,
    afterLicenseNumber: undefined,
    afterStatus: undefined,
    afterId: undefined,
    limit: 3,
  });

  await store.search(
    { tenantId, status: DriverStatus.Available },
    {
      mode: "cursor",
      pageSize: 2,
      cursor: first.nextCursor,
      sort: nameCursorSort,
    },
  );
  const secondSearch = fixture.calls.filter(
    (call) => call.statement === searchDriversCursor,
  )[1];
  assert.equal(
    (secondSearch?.params as { afterLastName: string }).afterLastName,
    "Baker",
  );
  assert.equal(
    (secondSearch?.params as { afterFirstName: string }).afterFirstName,
    "Alex",
  );

  await assert.rejects(
    () =>
      store.search(
        { tenantId, status: DriverStatus.Suspended },
        {
          mode: "cursor",
          pageSize: 2,
          cursor: first.nextCursor,
          sort: nameCursorSort,
        },
      ),
    /does not match/,
  );
  await assert.rejects(
    () =>
      store.search(
        { tenantId, status: DriverStatus.Available },
        {
          mode: "cursor",
          pageSize: 2,
          cursor: first.nextCursor,
          sort: { by: "licenseNumber", direction: "asc" },
        },
      ),
    /does not match/,
  );
});

test("id cursor position contains only the id", async () => {
  const fixture = databaseWithRows();
  const store = new PgDriverReadStore(fixture.database);
  const first = await store.search(
    { tenantId },
    { mode: "cursor", pageSize: 2, sort: idCursorSort },
  );
  assert.equal(first.mode, "cursor");
  if (first.mode !== "cursor" || !first.nextCursor) return;

  await store.search(
    { tenantId },
    {
      mode: "cursor",
      pageSize: 2,
      cursor: first.nextCursor,
      sort: idCursorSort,
    },
  );
  const calls = fixture.calls.filter(
    ({ statement }) => statement === searchDriversCursor,
  );
  assert.equal(
    (calls[1]?.params as { afterId: string }).afterId,
    "00000000-0000-4000-8000-000000000002",
  );
  assert.equal(
    (calls[1]?.params as { afterLastName?: string }).afterLastName,
    undefined,
  );
});

test("an empty page keeps its exact total without emitting a list item", async () => {
  const database = {
    exec: async () => [
      {
        id: null,
        first_name: null,
        last_name: null,
        license_number: null,
        depot_id: null,
        phone_number: null,
        status: null,
        totalItems: 7,
        certifications: [],
      },
    ],
  } as unknown as PgDatabase;

  const result = await new PgDriverReadStore(database).search(
    { tenantId },
    {
      mode: "page",
      page: 10,
      pageSize: 2,
      sort: {
        by: "name",
        lastNameDirection: "asc",
        firstNameDirection: "asc",
      },
    },
  );

  assert.equal(result.mode, "page");
  if (result.mode !== "page") return;
  assert.equal(result.totalItems, 7);
  assert.deepEqual(result.items, []);
});

test("page and cursor queries share filters while cursor uses tuple positions", async () => {
  const statements: string[] = [];
  const connection: IDatabaseConnection = {
    query: async (statement) => {
      statements.push(statement);
      return { rows: [], rowCount: 0 };
    },
  };
  const filters = {
    tenantId,
    status: DriverStatus.Available,
    depotId: undefined,
    lastNamePrefix: "Do",
    certificationType: "HAZMAT",
  };

  await searchDriversPage.run(
    {
      ...filters,
      sortBy: "name",
      lastNameDirection: "asc",
      firstNameDirection: "desc",
      idDirection: "desc",
      offset: 0,
      limit: 25,
    },
    connection,
  );
  await searchDriversCursor.run(
    {
      ...filters,
      sortBy: "name",
      direction: "asc",
      afterLastName: undefined,
      afterFirstName: undefined,
      afterLicenseNumber: undefined,
      afterStatus: undefined,
      afterId: undefined,
      limit: 26,
    },
    connection,
  );

  assert.equal(statements.length, 2);
  assert.equal(
    filteredDriversCte(statements[0] ?? ""),
    filteredDriversCte(statements[1] ?? ""),
  );
  assert.match(
    statements[1] ?? "",
    /\(d\.last_name, d\.first_name, d\.id\)\s+>/,
  );
  assert.doesNotMatch(statements[1] ?? "", /sort_value|sortField1/);
});

function filteredDriversCte(statement: string): string {
  const match = /WITH filtered_drivers AS \(([\s\S]*?)\n\),\ndriver_page AS/.exec(
    statement,
  );
  assert.ok(match, "Expected a filtered_drivers CTE.");
  return match[1];
}
