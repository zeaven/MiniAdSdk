import { AdInterceptor, AdParam, AdInvokeResultVoid, AdInvokeNext, IAdSdk } from "../Types"
import { mutex } from "../utils/AdUtils"

/**
 * 防并发广告
 */
export class MutexInterceptor implements AdInterceptor {
    attach(sdk: IAdSdk): void {
      const _method = this.showReward.bind(this)
      this.showReward = mutex(_method)
    }
    showReward (next: AdInvokeNext, param: AdParam): Promise<AdInvokeResultVoid> | void {
      return next(param)
    }
  }