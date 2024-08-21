/**
 * 激励视频
 */

import { AdInvokeResult, AdParam } from "../Types";
import { ManualPromise } from "../utils/AdUtils";
import AliBaseAd from "./AliBaseAd";
import AlipayAd from "./AlipayAd";

export default class AliRewardAd extends AliBaseAd {
  protected get name(): string { return '激励视频' }
  private rewardPromise?: ManualPromise<void>

  protected createAd(_id: string): any {
    if (!this.ad) {
      setTimeout(() => {
        this.ad && this.ad.load()
      }, 1000);
      return my.createRewardedAd({
        adUnitId: _id,
        multiton: true
      })
    } else {
      this.ad.load()
    }
    return this.ad
  }
  public show(param: AdParam): Promise<AdInvokeResult> {
    return super.show(param).then((res) => {
      if (this.rewardPromise) {
        this.rewardPromise.reject('')
      }
      this.rewardPromise = new ManualPromise<void>()
      res.rewardPromise = this.rewardPromise.promise
      return res
    })
  }
  public close(): void {
    // if (!this.ad || !this.ready) return
    // 激励视频广告不能手动关闭
    // this.ad.close()
  }

  protected reLoad(immediately: boolean): void {
    if (immediately) {
      // 关闭后立即重新加载
      AlipayAd.log(this.name + 'Ad reload')
      this.loadAd()
    } else {
      super.reLoad(immediately)
    }
  }
  protected noReadyDelayShow(delay: number): Promise<void> {
    // 激励视频未加载则直接返回错误，因为奖励物品不一致
    return Promise.reject(this.name + '加载中')
  }

  protected onClose(res: any): void {
    super.onClose(res)

    if (res && res.isEnded) {
      if (this.rewardPromise) {
        AlipayAd.log(this.name, '派发奖励')
        this.rewardPromise.resolve()
      }
    } else {
      if (this.rewardPromise) {
        AlipayAd.log(this.name, '奖励无效')
        this.rewardPromise.reject()
      }
    }
    this.rewardPromise = undefined
  }
}
