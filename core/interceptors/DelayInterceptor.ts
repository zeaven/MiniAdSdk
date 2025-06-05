import { AdInterceptor, AdInvokeNext, AdParam, AdInvokeResultVoid, IAdSdk } from "../Types"
import { delay } from "../utils/AdUtils"

/**
 * 激励视频延时1秒展示
 */
export class DelayInterceptor implements AdInterceptor {
    attach(sdk: IAdSdk): void {
      const _method = this.showReward.bind(this)
      this.showReward = delay(_method, 1000)
    }
    showReward (next: AdInvokeNext, param: AdParam): Promise<AdInvokeResultVoid> | void {
      return next(param)
    }
  }