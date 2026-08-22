export abstract class TrxManager {
  abstract run<TResult>(operation: () => Promise<TResult>): Promise<TResult>;
}
