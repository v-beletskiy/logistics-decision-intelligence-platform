import type {
  AddressProps,
  GeoCoordinateProps,
} from "../../../../../../shared/domain/value-objects/location";

/** Transport-independent input shared by create and replace-details use cases. */
export interface DepotDetailsInput {
  readonly name: string;
  readonly address: AddressProps;
  readonly location: GeoCoordinateProps;
}
