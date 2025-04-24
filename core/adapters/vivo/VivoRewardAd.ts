/**
 * 激励视频广告
 */


import { AdInvokeResult, AdParam } from '../../Types'
import { ManualPromise } from '../../utils/AdUtils'
import AdRewardBase from '../AdRewardBase'
import VivoBaseAd from './VivoBaseAd'
import log from "./VivoLog"

export default class VivoRewardAd extends AdRewardBase {
  get name(): string { return '激励视频' }
  protected log(...msg: any[]): void {
    log(...msg)
  }
  protected checkReward(res: any): boolean {
    return (res && res.isEnded) || res === undefined
  }

  protected createAd(_id: string): any {
    if (!this.ad) {
      this.isLoading = true // 激励视频创建时默认加载
      return globalThis.qg.createRewardedVideoAd({
        posId: _id,
        ...this.properties
      })
    }
    return this.ad
  }
}
