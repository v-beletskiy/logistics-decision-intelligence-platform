import {
  hydratePersistenceData,
  hydrateTimestamp,
} from "../../../../../../../shared/infra/persistence/persistence-hydration";
import { DriverCertification } from "../../../../domain/driver-certification.entity";
import { DriverCertificationId } from "../../../../domain/driver-certification-id";
import {
  Driver,
  DriverStatus,
  type DriverProps,
} from "../../../../domain/driver.aggregate";
import { DriverId } from "../../../../domain/driver-id";
import type { IInsertDriverParams } from "../queries/driver.insert.queries";
import type { IReconcileDriverCertificationsParams } from "../queries/driver.reconcile-certifications.queries";

interface DriverCertificationPersistenceData {
  readonly id: string;
  readonly type: string;
  readonly credentialNumber: string;
  readonly validFrom: string;
  readonly validUntil: string;
}

export interface DriverPersistenceRow {
  readonly id: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly license_number: string;
  readonly depot_id: string | null;
  readonly phone_number: string | null;
  readonly status: string;
  readonly certifications: unknown;
}

/** Maps between the complete Driver aggregate and its PostgreSQL representation. */
export class DriverMapper {
  static toDomain(row: DriverPersistenceRow): Driver {
    return hydratePersistenceData("driver", () => {
      const props: DriverProps = {
        firstName: row.first_name,
        lastName: row.last_name,
        licenseNumber: row.license_number,
        depotId: row.depot_id ?? undefined,
        phoneNumber: row.phone_number ?? undefined,
        status: row.status as DriverStatus,
        certifications: DriverMapper.certificationsToDomain(row.certifications),
      };
      return Driver.reconstitute(DriverId.from(row.id), props);
    });
  }

  static certificationsToDomain(
    value: unknown,
  ): readonly DriverCertification[] {
    return hydratePersistenceData("driver certifications", () =>
      (value as readonly DriverCertificationPersistenceData[]).map(
        (certification) =>
          DriverCertification.reconstitute(
            DriverCertificationId.from(certification.id),
            {
              type: certification.type,
              credentialNumber: certification.credentialNumber,
              validFrom: hydrateTimestamp(certification.validFrom),
              validUntil: hydrateTimestamp(certification.validUntil),
            },
          ),
      ),
    );
  }

  static toPersistence(tenantId: string, driver: Driver) {
    const root: IInsertDriverParams = {
      tenantId,
      id: driver.id.value,
      firstName: driver.firstName,
      lastName: driver.lastName,
      licenseNumber: driver.licenseNumber,
      depotId: driver.depotId,
      phoneNumber: driver.phoneNumber,
      status: driver.status,
    };

    const driverCertifications = driver.certifications;
    const certifications: IReconcileDriverCertificationsParams = {
      tenantId,
      driverId: driver.id.value,
      ids: driverCertifications.map((certification) => certification.id.value),
      types: driverCertifications.map((certification) => certification.type),
      credentialNumbers: driverCertifications.map(
        (certification) => certification.credentialNumber,
      ),
      validFromDates: driverCertifications.map(
        (certification) => certification.validFrom,
      ),
      validUntilDates: driverCertifications.map(
        (certification) => certification.validUntil,
      ),
    };
    return { root, certifications };
  }
}
