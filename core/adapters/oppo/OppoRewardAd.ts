/**
 * 激励视频广告
 */


import AdRewardBase from '../AdRewardBase'
import log from "./OppoLog"

export default class OppoRewardAd extends AdRewardBase {
  get name(): string { return '激励视频' }
  protected log(...msg: any[]): void {
    log(...msg)
  }
  protected checkReward(res: any): boolean {
    return res && res.isEnded || res === undefined
  }

  protected createAd(_id: string): any {
    if (!this.ad) {
      this.isLoading = true
      return globalThis.qg.createRewardedVideoAd({
        adUnitId: _id,
        ...this.properties
      })
    } 
    return this.ad
  }
 
  protected onLoad(res: any): void {
    super.onLoad(res)
    if (res && res == 'localAdVideo') {
      log(this.name, '兜底广告-onload触发')
    }
  }

}
