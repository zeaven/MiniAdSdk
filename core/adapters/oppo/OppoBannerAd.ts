/**
 * Banner广告
 */

import { AdParam, AdInvokeResult, Runnable } from "../../Types";
import OppoBaseAd from "./OppoBaseAd";

export default class OppoBannerAd extends OppoBaseAd {
  get name(): string {
      return 'banner广告'
  }
  private isHided = false
  
  protected getAdListeners(): Record<string, Runnable> {
    const listeners = super.getAdListeners()
    listeners['onHide'] = this.onClose.bind(this)
    return listeners
  }
  protected createAd(_id: string): any {
    this.isHided = false
    this.ready = true // 默认加载
    if (!this.ad) {
      // 注意：banner广告的高度和宽度需要和游戏的高度和宽度一致，否则会出现部分区域无法点击的问题
      return globalThis.qg.createBannerAd({
        adUnitId: _id,
        style: {
          top: 300,
          left: 0,
          width: this.properties.safeArea.width,
          height: 300,
        },
      })
    }
    return this.ad
  }
  
  public show(param: AdParam): Promise<AdInvokeResult> {
    let showPromise = super.show(param)
    // 隐藏后再显示没有回调？不清楚原因
    // if (!this.isHided) {
      return showPromise 
    // }
    // this.onShow()
    // this.invokeResult = { session: this }
    // return Promise.resolve(this.invokeResult)
  }
  public close(): void {
      super.close()
      this.isHided = true
  }
}
