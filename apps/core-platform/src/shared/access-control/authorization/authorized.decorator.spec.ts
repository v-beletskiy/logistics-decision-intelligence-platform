import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import { AuthorizationDeniedException } from './authorization.exceptions';
import { Authorized } from './authorized.decorator';
import { IdentityType } from '../identity/identity-type.enum';
import type { Identity } from '../identity/identity';
import { Permission } from '../permissions/permission.enum';

class FakeAccessManager {
  authorize(_identity: Identity, _permission: Permission): Promise<void> {
    return Promise.resolve();
  }
}

class AuthorizedHandler {
  constructor(private readonly access: FakeAccessManager) {}

  @Authorized(Permission.VehicleManage)
  async execute(_command: { identity: Identity }): Promise<string> {
    return 'executed';
  }
}

const identity: Identity = {
  id: 'user-1',
  type: IdentityType.User,
  roles: [],
};

test('authorizes with the command identity and declared permission', async () => {
  const access = new FakeAccessManager();
  let authorizedIdentity: Identity | undefined;
  let authorizedPermission: Permission | undefined;
  access.authorize = async (i: Identity, p: Permission) => {
    authorizedIdentity = i;
    authorizedPermission = p;
  };
  const handler = new AuthorizedHandler(access);

  await handler.execute({ identity });

  assert.equal(authorizedIdentity, identity);
  assert.equal(authorizedPermission, Permission.VehicleManage);
});

test('executes the original method when authorization succeeds', async () => {
  const handler = new AuthorizedHandler(new FakeAccessManager());

  const result = await handler.execute({ identity });

  assert.equal(result, 'executed');
});

test('does not execute the original method when authorization is denied', async () => {
  const access = new FakeAccessManager();
  access.authorize = async () => {
    throw new AuthorizationDeniedException('Denied.');
  };
  const handler = new AuthorizedHandler(access);

  await assert.rejects(() => handler.execute({ identity }), AuthorizationDeniedException);
});
