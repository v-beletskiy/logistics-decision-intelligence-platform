import { ValueObject } from "../../../../shared/domain/shared-kernel/core/value-object";
import {
  Address,
  type AddressProps,
} from "../../../../shared/domain/shared-kernel/value-objects/location/address";
import {
  TimeWindow,
  type TimeWindowProps,
} from "../../../../shared/domain/shared-kernel/value-objects/time";
import { assertPropsObject } from "../../../../shared/domain/shared-kernel/validation/primitives/object/assert-props-object";

export interface ShipmentEndpointProps {
  readonly address: AddressProps;
  readonly timeWindow: TimeWindowProps;
}

/** One pickup or delivery endpoint of a Shipment. */
export class ShipmentEndpoint extends ValueObject<ShipmentEndpoint> {
  readonly address: Address;
  readonly timeWindow: TimeWindow;

  private constructor(props: ShipmentEndpointProps) {
    super();
    assertPropsObject(props, "Shipment endpoint");
    this.address = Address.create(props.address);
    this.timeWindow = TimeWindow.create(props.timeWindow);
    Object.freeze(this);
  }

  static create(props: ShipmentEndpointProps): ShipmentEndpoint {
    return new ShipmentEndpoint(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.address, this.timeWindow];
  }
}
