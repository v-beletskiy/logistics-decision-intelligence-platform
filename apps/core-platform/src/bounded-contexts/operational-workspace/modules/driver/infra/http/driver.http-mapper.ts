import type { PaginationResult } from "@logistics-decision-intelligence/querying";

import type { DriverCertificationInput } from "../../app/models/driver-certification.input";
import type { DriverDetailsInput } from "../../app/models/driver-details.input";
import type { RegisterDriverInput } from "../../app/models/register-driver.input";
import type { DriverListItem } from "../../app/ports/driver-read-store";
import type { SearchDriversQueryInput } from "../../app/queries/search-drivers/search-drivers.query";
import type {
  CreatedDriverCertificationResponse,
  CreatedDriverResponse,
  DriverCertificationRequest,
  DriverDetailsRequest,
  DriverResponse,
  RegisterDriverRequest,
  SearchDriversRequest,
  SearchDriversResponse,
} from "./driver.http-contracts";

export class DriverHttpMapper {
  static toRegisterDriverInput(
    request: RegisterDriverRequest,
  ): RegisterDriverInput {
    return {
      firstName: request.firstName,
      lastName: request.lastName,
      licenseNumber: request.licenseNumber,
      depotId: request.depotId,
      phoneNumber: request.phoneNumber,
      certifications: request.certifications?.map(
        DriverHttpMapper.toDriverCertificationInput,
      ),
    };
  }

  static toCreatedDriverResponse(driverId: string): CreatedDriverResponse {
    return { id: driverId };
  }

  static toDriverDetailsInput(
    request: DriverDetailsRequest,
  ): DriverDetailsInput {
    return {
      firstName: request.firstName,
      lastName: request.lastName,
      licenseNumber: request.licenseNumber,
      depotId: request.depotId,
      phoneNumber: request.phoneNumber,
    };
  }

  static toDriverCertificationInput(
    request: DriverCertificationRequest,
  ): DriverCertificationInput {
    return {
      type: request.type,
      credentialNumber: request.credentialNumber,
      validFrom: new Date(request.validFrom),
      validUntil: new Date(request.validUntil),
    };
  }

  static toCreatedDriverCertificationResponse(
    certificationId: string,
  ): CreatedDriverCertificationResponse {
    return { id: certificationId };
  }

  static toSearchDriversQueryInput(
    request: SearchDriversRequest,
  ): SearchDriversQueryInput {
    return {
      mode: request.mode ?? "page",
      page: request.page,
      pageSize: request.pageSize,
      cursor: request.cursor,
      status: request.status,
      depotId: request.depotId,
      lastNamePrefix: request.lastNamePrefix,
      certificationType: request.certificationType,
      sortBy: request.sortBy,
      direction: request.direction,
    };
  }

  static toSearchDriversResponse(
    result: PaginationResult<DriverListItem>,
  ): SearchDriversResponse {
    const items = result.items.map(DriverHttpMapper.toDriverResponse);
    if (result.mode === "page") {
      return {
        mode: result.mode,
        items,
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      };
    }
    return {
      mode: result.mode,
      items,
      pageSize: result.pageSize,
      nextCursor: result.nextCursor,
    };
  }

  private static toDriverResponse(driver: DriverListItem): DriverResponse {
    return {
      id: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      licenseNumber: driver.licenseNumber,
      depotId: driver.depotId,
      phoneNumber: driver.phoneNumber,
      status: driver.status,
      certifications: driver.certifications.map((certification) => ({
        id: certification.id,
        type: certification.type,
        credentialNumber: certification.credentialNumber,
        validFrom: certification.validFrom,
        validUntil: certification.validUntil,
      })),
    };
  }
}
