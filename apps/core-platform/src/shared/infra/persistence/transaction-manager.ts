export abstract class TransactionManager {
  abstract run<TResult>(operation: () => Promise<TResult>): Promise<TResult>;
}
