import { AdType } from "../../Types";
import KsAdBase from "./KsAdBase";

export default class KsAdInters extends KsAdBase {
  constructor(...ids: any[]) {
    super(AdType.Interstitial, ...ids)
  }
  protected createAd(_id: string) {
    // 快手插屏广告创建后自动加载，且没有加载回调
    this.ready = true
    if (!this.ad) {
      return globalThis.ks.createInterstitialAd({
        adUnitId: _id,
      })
    }
    return this.ad
  }

  protected onShow(): void {
    // 快手插屏广告没有加载回调，onShow默认先触发加载成功
    this.onLoad()
    super.onShow()
  }
  
}
