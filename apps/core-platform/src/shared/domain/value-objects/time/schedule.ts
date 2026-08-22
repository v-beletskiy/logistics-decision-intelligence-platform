import { SHARED_DOMAIN_ERROR_CODES } from "../../domain-error-codes";
import { DomainException } from "../../domain.exceptions";
import { requireValidDate } from "../../validation/primitives/date/require-valid-date";
import { assertPropsObject } from "../../validation/primitives/object/assert-props-object";
import { ValueObject } from "../../core/value-object";

export interface ScheduleProps {
  readonly arrivalTime: Date;
  readonly departureTime: Date;
}

/** An immutable arrival and departure schedule. */
export class Schedule extends ValueObject<Schedule> {
  private readonly _arrivalTime: Date;
  private readonly _departureTime: Date;

  private constructor(props: ScheduleProps) {
    super();
    assertPropsObject(props, "Schedule");
    const arrivalTime = requireValidDate(
      props.arrivalTime,
      "Schedule arrival time",
    );
    const departureTime = requireValidDate(
      props.departureTime,
      "Schedule departure time",
    );
    if (arrivalTime >= departureTime) {
      throw new DomainException(
        "Schedule arrival time must be before departure time.",
        SHARED_DOMAIN_ERROR_CODES.invalidScheduleOrder,
      );
    }
    this._arrivalTime = arrivalTime;
    this._departureTime = departureTime;
    Object.freeze(this);
  }

  get arrivalTime(): Date {
    return new Date(this._arrivalTime);
  }

  get departureTime(): Date {
    return new Date(this._departureTime);
  }

  static create(props: ScheduleProps): Schedule {
    return new Schedule(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return [this._arrivalTime.getTime(), this._departureTime.getTime()];
  }
}
