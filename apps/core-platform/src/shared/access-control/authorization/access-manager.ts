import type { Identity } from '../identity/identity';
import { Permission } from '../permissions/permission.enum';

export abstract class AccessManager {
  abstract authorize(identity: Identity, permission: Permission): Promise<void>;
}
