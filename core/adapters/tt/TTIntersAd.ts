/**
 * 插屏广告
 */

import { AdParam, AdInvokeResult } from "../../Types";
import TTBaseAd from "./TTBaseAd";

export default class TTInsertAd extends TTBaseAd {
  protected get name(): string { return '插屏' }
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
