import { UserAccount } from "./user-account.js";

export abstract class UserAccountRepository {
  abstract findByEmail(normalizedEmail: string): Promise<UserAccount | null>;
  abstract add(account: UserAccount): Promise<void>;
}
