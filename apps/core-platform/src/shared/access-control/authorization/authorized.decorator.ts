import type { Identity } from "../identity/identity";
import { Permission } from "../permissions/permission.enum";
import { AccessManager } from "./access-manager";

export function Authorized(permission: Permission) {
  return (
    _target: object,
    _key: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const original = descriptor.value;
    descriptor.value = async function (
      this: { access: AccessManager },
      command: { identity: Identity },
    ) {
      await this.access.authorize(command.identity, permission);
      return original.call(this, command);
    };
    return descriptor;
  };
}
