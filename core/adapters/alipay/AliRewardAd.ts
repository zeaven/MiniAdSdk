/**
 * 激励视频
 */

import { AdType } from "../../Types";
import AdRewardBase from "../AdRewardBase";
import log from "./AliLog";

export default class AliRewardAd extends AdRewardBase   {
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
