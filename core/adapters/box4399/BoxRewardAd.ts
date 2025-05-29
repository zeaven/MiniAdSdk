import { AdInvokeResult, AdParam, AdType, Runnable } from "../../Types";
import { ManualPromise } from "../../utils/AdUtils";
import log from "./BoxLog"
import AdRewardBase from "../AdRewardBase";

export default class BoxRewardAd extends AdRewardBase {
  hasCompleted: boolean
  protected autoDestroy: boolean = true
  
  protected log(...msg: any[]): void {
    log(...msg)
  }

  protected getAdListeners(): Record<string, Runnable> {
    const listeners = super.getAdListeners()
    listeners['onCompleted'] = this.onCompleted.bind(this)
    return listeners
  }

  protected createAd(id: string): any {
    if (!this.ad) {
      this.isLoading = true // 激励视频创建时默认加载
      return globalThis.gamebox.createRewardedVideoAd()
    }
    return this.ad
  }

  protected onClose(res: any): void {
    super.onClose(res)
    this.hasCompleted = false
  }

  onCompleted() {
    this.hasCompleted = true
  }

  protected checkReward(res: any): boolean {
    return this.hasCompleted
  }
}
