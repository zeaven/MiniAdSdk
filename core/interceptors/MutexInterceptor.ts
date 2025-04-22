import { AdInterceptor, AdParam, AdInvokeResult, AdInvokeNext } from "../Types"
import { mutex } from "./support"

/**
 * 防并发广告
 */
export class MutexInterceptor implements AdInterceptor {
    attach(): void {
      const _method = this.showReward.bind(this)
      this.showReward = mutex(_method)
    }
    showReward (next: AdInvokeNext, param: AdParam): Promise<AdInvokeResult> | void {
      return next(param)
    }
  }