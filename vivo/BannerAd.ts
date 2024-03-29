/**
 * Banner广告
 */

import { AdParam, AdInvokeResult } from "../Types";
import BaseAd from "./BaseAd";

export default class BannerAd extends BaseAd {
  protected name: string = 'banner广告'
  private isHided = false
  protected createAd(_id: string): any {
    this.isHided = true
    return qg.createBannerAd({
      posId: _id,
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
