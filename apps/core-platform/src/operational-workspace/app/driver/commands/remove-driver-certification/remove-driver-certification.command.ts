export class RemoveDriverCertificationCommand {
  constructor(
    readonly driverId: string,
    readonly certificationId: string,
  ) {}
}
