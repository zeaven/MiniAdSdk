import { AdInvokeResult, AdParam } from "../Types";
import { ManualPromise } from "../utils/AdUtils";
import BoxAd from "./BoxAd";
import BoxBaseAd from "./BoxBaseAd";

export default class BoxRewardAd extends BoxBaseAd {
  rewardPromise?: ManualPromise<void>;
  unBindComplete: () => void;
  protected get name(): string { return '激励视频' }

  protected createAd(attrs?: Object): any {
    if (!this.ad) {
      return globalThis.gamebox.createRewardedVideoAd()
    } else {
      this.ad.load()
    }
    return this.ad
  }
  loadAd(): void {
    super.loadAd()
    // 监听视频完成
    const onCompletedBinder = this.onCompleted.bind(this)
    this.ad.onCompleted && this.ad.onCompleted(onCompletedBinder)
    this.unBindComplete = () => {
      this.ad.offCompleted && this.ad.offCompleted(onCompletedBinder)
    }
  }

  show(param: AdParam): Promise<AdInvokeResult> {
    return super.show(param).then((res) => {
      if (this.rewardPromise) this.rewardPromise.reject('广告超时')
      this.rewardPromise = new ManualPromise<void>()
      res.rewardPromise = this.rewardPromise.promise
      return res
    })
  }

  close(): void {
    // 不支持手动关闭
  }

  protected noReadyDelayShow(delay: number): Promise<AdInvokeResult> {
    // 激励视频未加载则直接返回错误，因为奖励物品不一致
    return Promise.reject(this.name + '加载中')
  }

  protected onClose(res: any): void {
    super.onClose(res)

    if (this.rewardPromise) {
      BoxAd.log(this.name, '奖励无效')
      this.rewardPromise.reject('用户关闭广告')
    }
    this.rewardPromise = undefined
  }

  onCompleted() {
    if (this.rewardPromise) {
      BoxAd.log(this.name, '派发奖励')
      this.rewardPromise.resolve();
    }
    this.rewardPromise = undefined
  }

  destroy(): void {
    this.unBindComplete && this.unBindComplete()
    this.unBindComplete = null
    super.destroy()
  }
}
