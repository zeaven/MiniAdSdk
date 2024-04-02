/**
 * 手动控制Promise
 */
class ManualPromise<T> {
  private _promise: Promise<T>
  private _resolve: (value: T | PromiseLike<T>) => void
  private _reject: (reason?: any) => void
  get promise() {
    return this._promise
  }

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  public resolve(value: T | PromiseLike<T>): void {
    this._resolve(value)
  }
  public reject(reason: string): void {
    this._reject(reason)
  }
}

export { ManualPromise }
