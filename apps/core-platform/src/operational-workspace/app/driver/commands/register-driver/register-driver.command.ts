import type { RegisterDriverInput } from "../../driver.inputs";

export class RegisterDriverCommand {
  constructor(readonly details: RegisterDriverInput) {}
}
