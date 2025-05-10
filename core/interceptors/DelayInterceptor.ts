import { AdInterceptor, AdInvokeNext, AdParam, AdInvokeResult, IAdSdk } from "../Types"
import { delay } from "./support"

/**
 * 激励视频延时1秒展示
 */
export class DelayInterceptor implements AdInterceptor {
    attach(sdk: IAdSdk): void {
      const _method = this.showReward.bind(this)
      this.showReward = delay(_method, 1000)
    }
    showReward (next: AdInvokeNext, param: AdParam): Promise<AdInvokeResult> | void {
      return next(param)
    }
  }