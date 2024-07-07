/**
 * Banner广告
 */

import { AdParam, AdInvokeResult } from "../Types";
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

  protected bindAdListeners(): () => void {
    if (!this.autoUnbindListener && this.unbindAdListeners) {
      return this.unbindAdListeners
    }
    // Unbind the last listeners First
    if (this.unbindAdListeners) this.unbindAdListeners()
    if (!this.ad) return () => {}
    let onErrorBinder = this.onError.bind(this)
    // let onLoadBinder = this.onShow.bind(this)
    let onCloseBinder = this.onClose.bind(this)
    this.ad.onError && this.ad.onError(onErrorBinder)
    // this.ad.onLoad && this.ad.onLoad(onLoadBinder)
    this.ad.onClose && this.ad.onClose(onCloseBinder)
    this.onLoad(null)
    return () => {
      if (!this.ad) return
      this.ad.offError && this.ad.offError(onErrorBinder)
      // this.ad.offLoad && this.ad.offLoad(onLoadBinder)
      this.ad.offClose && this.ad.offClose(onCloseBinder)
    }
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
