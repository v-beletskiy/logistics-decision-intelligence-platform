import type { DriverDetailsInput } from "../../driver.inputs";

export class UpdateDriverDetailsCommand {
  constructor(
    readonly driverId: string,
    readonly details: DriverDetailsInput,
  ) {}
}
