/**
 * 激励视频广告
 */


import AdRewardBase from '../AdRewardBase'
import log from "./TTLog"

export default class TTRewardAd extends AdRewardBase {
  protected get name(): string { return '激励视频' }
  protected log(...msg: any[]): void {
    log(...msg)
  }
  protected checkReward(res: any): boolean {
    return (res && res.isEnded) || (res && res.count)
  }
  
  protected createAd(_id: string): any {
    if (!this.ad) {
      return globalThis.tt.createRewardedVideoAd({
        adUnitId: _id,
      })
    } else {
      // 注意 1：
      // 为了保证广告价值，广告关闭后可以在用户操作时直接调用 show 进行广告的显示，而不需再次调用 load。
      // this.rewardAd.load()
    }
    return this.ad
  }
  
}
