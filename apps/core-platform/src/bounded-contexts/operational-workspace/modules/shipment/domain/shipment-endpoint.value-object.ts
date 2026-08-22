import { ValueObject } from "../../../../../shared/domain/core/value-object";
import {
  Address,
  type AddressProps,
} from "../../../../../shared/domain/value-objects/location/address";
import {
  GeoCoordinate,
  type GeoCoordinateProps,
} from "../../../../../shared/domain/value-objects/location/geo-coordinate";
import {
  TimeWindow,
  type TimeWindowProps,
} from "../../../../../shared/domain/value-objects/time";
import { assertPropsObject } from "../../../../../shared/domain/validation/primitives/object/assert-props-object";

export interface ShipmentEndpointProps {
  readonly address: AddressProps;
  readonly location: GeoCoordinateProps;
  readonly timeWindow: TimeWindowProps;
}

/** One pickup or delivery endpoint of a Shipment. */
export class ShipmentEndpoint extends ValueObject<ShipmentEndpoint> {
  readonly address: Address;
  readonly location: GeoCoordinate;
  readonly timeWindow: TimeWindow;

  private constructor(props: ShipmentEndpointProps) {
    super();
    assertPropsObject(props, "Shipment endpoint");
    this.address = Address.create(props.address);
    this.location = GeoCoordinate.create(props.location);
    this.timeWindow = TimeWindow.create(props.timeWindow);
    Object.freeze(this);
  }

  static create(props: ShipmentEndpointProps): ShipmentEndpoint {
    return new ShipmentEndpoint(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.address, this.location, this.timeWindow];
  }
}
