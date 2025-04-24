import log from "./HwLog"
import AdRewardBase from "../AdRewardBase";

export default class HwRewardAd extends AdRewardBase {
  get name(): string { return '激励视频' }
  protected log(...msg: any[]): void {
    log(...msg)
  }
  protected checkReward(res: any): boolean {
    return res && res.isEnded || res === undefined
  }
  protected createAd(_id: string): any {
    if (!this.ad) {
      return qg.createRewardedVideoAd({
        adUnitId: _id,
      })
    }
    return this.ad
  }
  
}
