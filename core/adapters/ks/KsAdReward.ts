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
    if (!this.ad) {
      return globalThis.ks.createRewardedVideoAd({
        adUnitId: _id,
      })
    }
    return this.ad
  }
 
}
