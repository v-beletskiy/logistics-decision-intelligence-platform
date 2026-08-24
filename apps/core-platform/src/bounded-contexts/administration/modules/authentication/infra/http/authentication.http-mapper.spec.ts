import * as assert from "node:assert/strict";
import { test } from "node:test";

import { AuthenticationHttpMapper } from "./authentication.http-mapper.js";

test("AuthenticationHttpMapper maps the application token to its public response", () => {
  assert.deepEqual(
    AuthenticationHttpMapper.toAccessTokenResponse({
      accessToken: "token",
      tokenType: "Bearer",
      expiresIn: 900,
    }),
    {
      accessToken: "token",
      tokenType: "Bearer",
      expiresIn: 900,
    },
  );
});
