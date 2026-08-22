import type { RegisterDriverInput } from "../../models/register-driver.input";

export class RegisterDriverCommand {
  constructor(readonly details: RegisterDriverInput) {}
}
