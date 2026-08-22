export interface DriverCertificationInput {
  readonly type: string;
  readonly credentialNumber: string;
  readonly validFrom: Date;
  readonly validUntil: Date;
}
