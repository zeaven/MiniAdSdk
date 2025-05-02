import log from "./KsLog"
import AdRewardBase from "../AdRewardBase";

export default class KsAdReward extends AdRewardBase {
  get name(): string { return '激励视频' }
  protected log(...msg: any[]): void {
    log(...msg)
  }
  protected checkReward(res: any): boolean {
    return res && res.isEnded || res === undefined
  }
  protected createAd(_id: string): any {
    // 快手激励视频广告创建后自动加载，且没有加载回调
    this.ready = true
    if (!this.ad) {
      return globalThis.ks.createRewardedVideoAd({
        adUnitId: _id,
      })
    }
    return this.ad
  }

  protected onShow(): void {
    // 快手激励视频广告没有加载回调，onShow默认先触发加载成功
    this.onLoad()
    super.onShow()
  }
}
