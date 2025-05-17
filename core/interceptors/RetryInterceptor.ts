import { AdInterceptor, AdType, AdInvokeNext, AdParam, AdInvokeResult, IAdSdk } from "../Types"
import { retry } from "../utils/AdUtils"

/**
 * 重试广告
 */
export class RetryInterceptor implements AdInterceptor {
    count: number;
    timeoutMs: number;
    adTypes: AdType[];
    /**
     * 
     * @param count 重试次数
     * @param timeoutMs 重试超时时间
     * @param {AdType} adTypes - 需要重试的广告类型
     */
    constructor (count: number, timeoutMs: number, adTypes: AdType[]) {
      this.count = count
      this.timeoutMs = timeoutMs
      this.adTypes = adTypes
    }
    attach(sdk: IAdSdk): void {
      this.retryShow = retry(this.retryShow.bind(this), this.count, 100, this.timeoutMs)
    }
  
    show (next: AdInvokeNext, param: AdParam, adType: AdType): Promise<AdInvokeResult> | void {
      if (!this.adTypes.includes(adType)) {
        return next(param)
      }
      return this.retryShow(next, param)
    }

    retryShow (next: AdInvokeNext, param: AdParam): Promise<AdInvokeResult> | void {
      return next(param)
    }
  
    showCustom (next: AdInvokeNext, param: AdParam): Promise<AdInvokeResult> | void {
      return this.show(next, param, AdType.Custom)
    }
  
    showInters (next: AdInvokeNext, param: AdParam): Promise<AdInvokeResult> | void {
      return this.show(next, param, AdType.Interstitial)
    }
  }