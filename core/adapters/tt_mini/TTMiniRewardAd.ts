/**
 * 激励视频广告
 */


import { AdType } from '../../Types'
import AdRewardBase from '../AdRewardBase'
import log from "./TTMiniLog"

export default class TTMiniRewardAd extends AdRewardBase {
  protected type: AdType = AdType.Reward
  protected log(...msg: any[]): void {
    log(...msg)
  }
  protected checkReward(res: any): boolean {
    // 只要展示成功就获取奖励
    return true
  }
  
  protected createAd(_id: string): any {
    // 激励视频执行show的时候才会拉取
    this.ready = true
    // 每一个激励广告实例 rewardedVideoAd 只能被 show 一次，展示之后实例被释放，需要重新创建广告实例。
    return globalThis.TTMinis.game.createRewardedVideoAd({
      adUnitId: _id,
    })
  }
 
  protected onShow(): void {
    // 快手激励视频广告没有加载回调，onShow默认先触发加载成功
    this.onLoad()
    super.onShow()
  }
}
