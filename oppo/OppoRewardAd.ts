/**
 * 激励视频广告
 */


import { AdHandler, AdInvokeResult, AdParam } from '../Types'
import OppoBaseAd from './OppoBaseAd'
import OppoAd from './OppoAd'

export default class OppoRewardAd extends OppoBaseAd {
  protected get name(): string {
      return '激励视频广告'
  }
  protected autoUnbindListener: boolean = false
  private rewardPromise?: Promise<void>
  private rewardResolve?: (value?: any) => void
  private rewardReject?: (reason?: any) => void
  protected createInterval = 1000

  protected createAd(_id: string): any {
    if (!this.ad) {
      return globalThis.qg.createRewardedVideoAd({
        adUnitId: _id,
        ...this.properties
      })
    } else {
      this.ad.load()
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

  protected onLoad(res: any): void {
    super.onLoad(res)
    if (res && res == 'localAdVideo') {
      OppoAd.log(this.name, '兜底广告-onload触发')
    }
  }

  protected reLoad(immediately: boolean): void {
    if (immediately) {
      // 关闭后立即重新加载
      OppoAd.log(this.name + 'Ad reload')
      this.loadAd()
    } else {
      super.reLoad(immediately)
    }
  }

  protected noReadyDelayShow(delay: number): Promise<AdInvokeResult> {
    // 激励视频未加载则直接返回错误，因为奖励物品不一致
    return Promise.reject(this.name + '加载中')
  }

  protected onClose(res: any): void {
    super.onClose(res)

    if ((res && res.isEnded) || res === undefined) {
      if (this.rewardResolve) {
        OppoAd.log(this.name, '派发奖励')
        this.rewardResolve()
      }
    } else {
      if (this.rewardReject) {
        OppoAd.log(this.name, '奖励无效')
        this.rewardReject()
      }
    }
    this.rewardPromise = undefined
    this.rewardResolve = undefined
    this.rewardReject = undefined
  }

  public destroy(): void {
    // 激励视频是单实例，不用销毁
  //   if (this.isShowed) return
  //   super.destroy()
  }
}
