import { AdInvokeResult, AdParam } from "../../Types";
import { ManualPromise } from "../../utils/AdUtils";
import log from "./BoxLog"
import AdRewardBase from "../AdRewardBase";

export default class BoxRewardAd extends AdRewardBase {
  hasCompleted: boolean
  protected autoDestroy: boolean = true
  
  protected get name(): string { return '激励视频' }
  protected log(...msg: any[]): void {
    log(...msg)
  }

  constructor() {
    super()

    this.adListeners['onCompleted'] = this.onCompleted.bind(this)
    this.ad['onCompleted'] && this.ad['onCompleted'](this.adListeners['onCompleted'])
  }

  protected createAd(attrs?: Object): any {
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
