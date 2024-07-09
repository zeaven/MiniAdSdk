/**
 * 插屏广告
 */

import { AdParam, AdInvokeResult } from "../Types";
import TTBaseAd from "./TTBaseAd";

export default class TTInsertAd extends TTBaseAd {
  protected name: string = '插屏广告'
  private hasShowed = false
  protected createAd(_id: string): any {
    this.hasShowed = false
    if (!this.ad) {
      return globalThis.tt.createInterstitialAd({
        adUnitId: _id,
      })
    }
    return this.ad
  }

  public show(param: AdParam): Promise<AdInvokeResult> {
      return super.show(param).then(res => {
        this.hasShowed = true
        return res
      })
  }

  public close(): void {
      // 插屏广告没有关闭功能
  }

  protected onError(err: any): void {
    this.reloadCount++
    let delayMilliSeconds = Math.min(
      10000,
      this.createInterval * this.reloadCount
    )
    if (err && err.errCode === 2002) {
      delayMilliSeconds = 30
    }
    // 加载失败发起重试
    this.reLoad(delayMilliSeconds)
  }

  public destroy(): void {
      // 1. 当前插屏广告只有被展示后，才能销毁
      if (!this.hasShowed) return
      super.destroy()
  }
}
