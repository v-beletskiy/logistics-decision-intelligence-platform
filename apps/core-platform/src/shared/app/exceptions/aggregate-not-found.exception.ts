import { ApplicationException } from './application.exception';

export class AggregateNotFoundException extends ApplicationException {
  constructor(aggregateName: string, message?: string) {
    super(message ?? `${aggregateName} not found.`);
  }
}
