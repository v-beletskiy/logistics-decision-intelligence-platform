import { UserAccount } from "./user-account";

export abstract class UserAccountRepository {
  abstract findByEmail(normalizedEmail: string): Promise<UserAccount | null>;
  abstract add(account: UserAccount): Promise<void>;
}
