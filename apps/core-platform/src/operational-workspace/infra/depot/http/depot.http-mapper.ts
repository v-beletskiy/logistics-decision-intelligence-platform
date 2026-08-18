import type { DepotDetailsInput } from "../../../app/depot/depot.inputs";
import type {
  CreateDepotRequest,
  CreatedDepotResponse,
  UpdateDepotDetailsRequest,
} from "./depot.http-contracts";

export class DepotHttpMapper {
  static toDepotDetailsInput(
    request: CreateDepotRequest | UpdateDepotDetailsRequest,
  ): DepotDetailsInput {
    return {
      name: request.details.name,
      address: request.details.address,
    };
  }

  static toCreatedDepotResponse(depotId: string): CreatedDepotResponse {
    return { id: depotId };
  }
}
