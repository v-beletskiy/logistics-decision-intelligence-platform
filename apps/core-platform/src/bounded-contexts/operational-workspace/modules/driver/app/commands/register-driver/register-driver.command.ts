import type { RegisterDriverInput } from "../../models/register-driver.input.js";

export class RegisterDriverCommand {
  constructor(readonly details: RegisterDriverInput) {}
}
