import * as assert from "node:assert/strict";
import { test } from "node:test";

import { AccessManager } from "../../../../../../../shared/modules/access-control/app/authorization/access-manager.js";
import type { Identity } from "../../../../../../../shared/modules/access-control/app/identity/identity.js";
import { IdentityType } from "../../../../../../../shared/modules/access-control/app/identity/identity-type.enum.js";
import type { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import {
  UseCaseContext,
  type UseCaseRequest,
} from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { DriverStatus } from "../../../domain/driver.aggregate.js";
import {
  DriverReadStore,
  type DriverSearchCriteria,
} from "../../ports/driver-read-store.js";
import type { DriverSearchOptions } from "./driver-search-options.js";
import { SearchDriversHandler } from "./search-drivers.handler.js";
import {
  SearchDriversQuery,
  type SearchDriversQueryInput,
} from "./search-drivers.query.js";

const tenantId = "00000000-0000-4000-8000-000000000010";
const identity: Identity = {
  id: "user-1",
  tenantId,
  type: IdentityType.User,
  roles: [],
};

class AllowAccessManager extends AccessManager {
  async authorize(
    _identity: Identity,
    _permission: Permission,
  ): Promise<void> {}
}

class RecordingDriverReadStore extends DriverReadStore {
  calls: Array<{
    criteria: DriverSearchCriteria;
    options: DriverSearchOptions;
  }> = [];

  async search(criteria: DriverSearchCriteria, options: DriverSearchOptions) {
    this.calls.push({ criteria, options });
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
  input: SearchDriversQueryInput = { mode: "page" },
): UseCaseRequest<SearchDriversQuery> {
  return {
    context: UseCaseContext.fromIdentity(identity),
    input: new SearchDriversQuery(input),
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

  assert.deepEqual(drivers.calls[0]?.options, {
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

  assert.deepEqual(drivers.calls[0]?.options, {
    mode: "cursor",
    pageSize: 25,
    cursor: undefined,
    sort: {
      by: "id",
      direction: "asc",
    },
  });
});

test("Driver page name search applies one stable direction to both fields", async () => {
  const drivers = new RecordingDriverReadStore();

  await handlerWith(drivers).exec(
    query({
      mode: "page",
      sortBy: "name",
      direction: "desc",
    }),
  );

  assert.deepEqual(drivers.calls[0]?.options, {
    mode: "page",
    page: 1,
    pageSize: 25,
    sort: {
      by: "name",
      lastNameDirection: "desc",
      firstNameDirection: "desc",
    },
  });
});

test("Driver cursor search uses one direction for its complete field set", async () => {
  const drivers = new RecordingDriverReadStore();

  await handlerWith(drivers).exec(
    query({
      mode: "cursor",
      sortBy: "name",
      direction: "desc",
    }),
  );

  assert.deepEqual(drivers.calls[0]?.options, {
    mode: "cursor",
    pageSize: 25,
    cursor: undefined,
    sort: { by: "name", direction: "desc" },
  });
});

test("Driver search scopes typed filters to the execution tenant", async () => {
  const drivers = new RecordingDriverReadStore();

  await handlerWith(drivers).exec(
    query({
      mode: "page",
      status: DriverStatus.Available,
      lastNamePrefix: "Do",
      certificationType: "HAZMAT",
    }),
  );

  assert.deepEqual(drivers.calls[0]?.criteria, {
    tenantId,
    status: "AVAILABLE",
    depotId: undefined,
    lastNamePrefix: "Do",
    certificationType: "HAZMAT",
  });
});
