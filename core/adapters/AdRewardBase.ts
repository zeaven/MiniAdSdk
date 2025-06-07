import { AdEventType, AdHandler, AdInvokeResult, AdParam, AdType, Runnable } from "../Types";
import { ManualPromise } from "../utils/AdUtils";
import AdBase from "./AdBase";

export default abstract class AdRewardBase extends AdBase {
  private rewardPromise?: ManualPromise<void>
  protected autoDestroy: boolean = false

  constructor(...ids: any[]) {
    super(AdType.Reward, ...ids)
  }

  protected abstract checkReward(res: any): boolean

  public show(param: AdParam): Promise<AdInvokeResult> {
    return super.show(param).then((res: AdInvokeResult) => {
      if (this.rewardPromise) this.rewardPromise.reject()
      this.rewardPromise = new ManualPromise()
      res.rewardPromise = this.rewardPromise.promise
      return res
    })
  }
  public close(): void {
    // if (!this.ad || !this.ready) return
    // 激励视频广告不能手动关闭
    // this.ad.close()
  }


  protected delayShowWaitLoaded(delay: number): Promise<void> {
    // 激励视频未加载则直接返回错误，因为奖励物品不一致
    return Promise.reject(this.name + '加载中')
  }

  protected onClose(res: any): void {
    super.onClose(res)

    if (this.checkReward(res)) {
      if (this.rewardPromise) {
        this.log(this.name, '派发奖励')
        this.rewardPromise.resolve()
      }
    } else {
      if (this.rewardPromise) {
        this.log(this.name, '奖励无效')
        this.rewardPromise.reject()
      }
    }
    this.rewardPromise = undefined
  }

}
