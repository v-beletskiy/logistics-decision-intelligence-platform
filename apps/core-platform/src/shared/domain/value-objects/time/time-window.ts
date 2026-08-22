import { SHARED_DOMAIN_ERROR_CODES } from "../../domain-error-codes";
import { DomainException } from "../../domain.exceptions";
import { requireValidDate } from "../../validation/primitives/date/require-valid-date";
import { assertPropsObject } from "../../validation/primitives/object/assert-props-object";
import { ValueObject } from "../../core/value-object";

export interface TimeWindowProps {
  readonly start: Date;
  readonly end: Date;
}

/** An immutable time interval whose start does not follow its end. */
export class TimeWindow extends ValueObject<TimeWindow> {
  private readonly _start: Date;
  private readonly _end: Date;

  private constructor(props: TimeWindowProps) {
    super();
    assertPropsObject(props, "Time window");
    const start = requireValidDate(props.start, "Time window start");
    const end = requireValidDate(props.end, "Time window end");
    if (start > end) {
      throw new DomainException(
        "A time window start cannot be later than its end.",
        SHARED_DOMAIN_ERROR_CODES.invalidTimeWindowOrder,
      );
    }
    this._start = start;
    this._end = end;
    Object.freeze(this);
  }

  static create(props: TimeWindowProps): TimeWindow {
    return new TimeWindow(props);
  }

  get start(): Date {
    return new Date(this._start);
  }

  get end(): Date {
    return new Date(this._end);
  }

  protected equalityComponents(): readonly unknown[] {
    return [this._start.getTime(), this._end.getTime()];
  }
}
