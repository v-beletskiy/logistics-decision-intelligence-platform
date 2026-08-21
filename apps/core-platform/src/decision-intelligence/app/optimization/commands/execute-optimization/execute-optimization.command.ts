export class ExecuteOptimizationCommand {
  constructor(
    readonly tenantId: string,
    readonly optimizationId: string,
  ) {}
}