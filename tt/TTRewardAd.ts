/**
 * 激励视频广告
 */


import { AdHandler, AdInvokeResult, AdParam } from '../Types'
import TTBaseAd from './TTBaseAd'
import TTAd from './TTAd'

export default class TTRewardAd extends TTBaseAd {
  protected name: string = '激励视频广告'
  protected autoUnbindListener: boolean = false
  private rewardPromise?: Promise<void>
  private rewardResolve?: (value?: any) => void
  private rewardReject?: (reason?: any) => void
  protected createInterval = 1000

  protected createAd(_id: string): any {
    if (!this.ad) {
      // tt 没有自动预加载，手动加载
      setTimeout(() => {
        this.ad && this.ad.load()
      }, 1000);
      return tt.createRewardedVideoAd({
        posId: _id,
      })
    } else {
      // 注意 1：
      // 为了保证广告价值，广告关闭后可以在用户操作时直接调用 show 进行广告的显示，而不需再次调用 load。
      // this.rewardAd.load()
    }
    return this.ad
  }
  public show(param: AdParam): Promise<AdInvokeResult> {
    return super.show(param).then((res) => {
      if (this.rewardReject) this.rewardReject()
      this.rewardPromise = new Promise((rewardResolve, rewardReject) => {
        this.rewardResolve = (...arg) => rewardResolve(...arg)
        this.rewardReject = (err) => rewardReject(err)
      })
      res.rewardPromise = this.rewardPromise
      return res
    })
  }
  public close(): void {
    // if (!this.ad || !this.ready) return
    // 激励视频广告不能手动关闭
    // this.ad.close()
  }

  protected reLoad(delay: number): void {
    if (delay === this.createInterval) {
      // 关闭后立即重新加载
      TTAd.log(this.name + '重新加载')
      this.loadAd()
    } else {
      super.reLoad(delay)
    }
  }

  protected noReadyDelayShow(param: AdParam): Promise<AdInvokeResult> {
    // 激励视频未加载则直接返回错误，因为奖励物品不一致
    return Promise.reject(this.name + '加载中')
  }

  protected onClose(res: any): void {
    super.onClose(res)
    this.ready = true
  

    if ((res && res.isEnded) || (res && res.count)) {
      if (this.rewardResolve) {
        TTAd.log(this.name, '派发奖励')
        this.rewardResolve()
      }
    } else {
      if (this.rewardReject) {
        TTAd.log(this.name, '奖励无效')
        this.rewardReject()
      }
    }
    this.rewardPromise = undefined
    this.rewardResolve = undefined
    this.rewardReject = undefined
  }

  public destroy(): void {
    // 激励视频是单实例，不用销毁
    // if (this.isShowed) return
    // super.destroy()
  }
}
