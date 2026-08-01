import { Injectable } from '@nestjs/common';

import { RegisterDriverCommand } from './register-driver.command';

@Injectable()
export class RegisterDriverHandler {
  async execute(_command: RegisterDriverCommand): Promise<void> {
    // Orchestration is intentionally deferred.
  }
}
