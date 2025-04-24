/**
 * 激励视频
 */

import AdRewardBase from "../AdRewardBase";
import log from "./AliLog";

export default class AliRewardAd extends AdRewardBase   {
  get name(): string { return '激励视频' }
  protected log(...msg: any[]): void {
    log(...msg)
  }

  protected createAd(_id: string): any {
    if (!this.ad) {
      return my.createRewardedAd({
        adUnitId: _id,
        // multiton: true
      })
    }
    return this.ad
  }

  protected checkReward(res: any): boolean {
    return res && res.isEnded || res === undefined
  }
  
}
