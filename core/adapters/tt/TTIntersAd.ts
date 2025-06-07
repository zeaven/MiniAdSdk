/**
 * 插屏广告
 */

import { AdParam, AdInvokeResult, AdType } from "../../Types";
import TTBaseAd from "./TTBaseAd";

export default class TTIntersAd extends TTBaseAd {
  constructor(...ids: any[]) {
    super(AdType.Interstitial, ...ids);
  }
  protected createAd(_id: string): any {
    if (!this.ad) {
      return globalThis.tt.createInterstitialAd({
        adUnitId: _id,
      })
    }
    return this.ad
  }


  public destroy(): void {
      // 1. 当前插屏广告只有被展示后，才能销毁
      if (!this.isShowed) return
      super.destroy()
  }
}
