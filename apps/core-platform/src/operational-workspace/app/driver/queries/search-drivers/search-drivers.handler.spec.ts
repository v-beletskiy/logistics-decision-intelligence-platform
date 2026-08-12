import * as assert from "node:assert/strict";
import { test } from "node:test";

import { AccessManager } from "../../../../../shared/access-control/authorization/access-manager";
import type { Identity } from "../../../../../shared/access-control/identity/identity";
import { IdentityType } from "../../../../../shared/access-control/identity/identity-type.enum";
import type { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import {
  ExecutionContext,
  type ExecutionRequest,
} from "../../../../../shared/app/execution/execution-context";
import { DriverStatus } from "../../../../domain-modules/driver/domain/driver.aggregate";
import {
  DriverReadStore,
  type DriverSearchCriteria,
} from "./driver-read-store";
import type {
  DriverSearchFilters,
  DriverSearch,
  DriverSearchInput,
} from "./driver-search";
import { SearchDriversHandler } from "./search-drivers.handler";
import { SearchDriversQuery } from "./search-drivers.query";

const tenantId = "00000000-0000-4000-8000-000000000010";
const identity: Identity = {
  id: "user-1",
  tenantId,
  type: IdentityType.User,
  roles: [],
};

class AllowAccessManager extends AccessManager {
  async authorize(_identity: Identity, _permission: Permission): Promise<void> {}
}

class RecordingDriverReadStore extends DriverReadStore {
  calls: Array<{
    criteria: DriverSearchCriteria;
    search: DriverSearch;
  }> = [];

  async search(
    criteria: DriverSearchCriteria,
    search: DriverSearch,
  ) {
    this.calls.push({ criteria, search });
    return {
      mode: "page" as const,
      items: [],
      page: 1,
      pageSize: 25,
      totalItems: 0,
      totalPages: 0,
    };
  }
}

function query(
  search: DriverSearchInput = { mode: "page" },
  filters: DriverSearchFilters = {},
): ExecutionRequest<SearchDriversQuery> {
  return {
    context: ExecutionContext.fromIdentity(identity),
    input: new SearchDriversQuery(filters, search),
  };
}

function handlerWith(drivers: DriverReadStore): SearchDriversHandler {
  const handler = new SearchDriversHandler(drivers);
  const injectedProperty = Object.getOwnPropertySymbols(
    SearchDriversHandler.prototype,
  ).find((property) => property.description === "authorizedAccessManager");
  assert.ok(injectedProperty);
  Reflect.set(handler, injectedProperty, new AllowAccessManager());
  return handler;
}

test("Driver search defaults to the database id ordering", async () => {
  const drivers = new RecordingDriverReadStore();

  await handlerWith(drivers).exec(query());

  assert.deepEqual(drivers.calls[0]?.search, {
    mode: "page",
    page: 1,
    pageSize: 25,
    sort: {
      by: "id",
      direction: "asc",
    },
  });
});

test("Driver cursor search has its own default database id ordering", async () => {
  const drivers = new RecordingDriverReadStore();

  await handlerWith(drivers).exec(query({ mode: "cursor" }));

  assert.deepEqual(drivers.calls[0]?.search, {
    mode: "cursor",
    pageSize: 25,
    cursor: undefined,
    sort: {
      by: "id",
      direction: "asc",
    },
  });
});

test("Driver page search accepts independent directions in a supported field set", async () => {
  const drivers = new RecordingDriverReadStore();
  const sort = {
    by: "name",
    lastNameDirection: "asc",
    firstNameDirection: "desc",
  } as const;

  await handlerWith(drivers).exec(query({ mode: "page", sort }));

  assert.deepEqual(drivers.calls[0]?.search, {
    mode: "page",
    page: 1,
    pageSize: 25,
    sort: {
      by: "name",
      lastNameDirection: "asc",
      firstNameDirection: "desc",
    },
  });
});

test("Driver cursor search uses one direction for its complete field set", async () => {
  const drivers = new RecordingDriverReadStore();

  await handlerWith(drivers).exec(
    query({
      mode: "cursor",
      sort: { by: "name", direction: "desc" },
    }),
  );

  assert.deepEqual(drivers.calls[0]?.search, {
    mode: "cursor",
    pageSize: 25,
    cursor: undefined,
    sort: { by: "name", direction: "desc" },
  });
});

test("Driver search scopes typed filters to the execution tenant", async () => {
  const drivers = new RecordingDriverReadStore();

  await handlerWith(drivers).exec(
    query(
      { mode: "page" },
      {
        status: DriverStatus.Available,
        lastNamePrefix: "Do",
        certificationType: "HAZMAT",
      },
    ),
  );

  assert.deepEqual(drivers.calls[0]?.criteria, {
    tenantId,
    status: "AVAILABLE",
    lastNamePrefix: "Do",
    certificationType: "HAZMAT",
  });
});
