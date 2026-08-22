import type { DepotDetailsInput } from "../../app/models/depot-details.input";
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
      location: request.details.location,
    };
  }

  static toCreatedDepotResponse(depotId: string): CreatedDepotResponse {
    return { id: depotId };
  }
}
