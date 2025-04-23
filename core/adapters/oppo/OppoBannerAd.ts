/**
 * Banner广告
 */

import { AdParam, AdInvokeResult } from "../../Types";
import OppoBaseAd from "./OppoBaseAd";

export default class OppoBannerAd extends OppoBaseAd {
  protected get name(): string {
      return 'banner广告'
  }
  private isHided = false
  protected createAd(_id: string): any {
    this.isHided = false
    return globalThis.qg.createBannerAd({
      adUnitId: _id,
      ...this.properties
    })
  }
  
  public show(param: AdParam): Promise<AdInvokeResult> {
    let showPromise = super.show(param)
    // 隐藏后再显示没有回调？不清楚原因
    if (!this.isHided) {
      return showPromise 
    }
    this.onShow()
    this.invokeResult = { session: this }
    return Promise.resolve(this.invokeResult)
  }
  public close(): void {
      super.close()
      this.isHided = true
  }
}
