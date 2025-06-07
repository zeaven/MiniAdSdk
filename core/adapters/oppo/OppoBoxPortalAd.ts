/**
 * 原生模板广告
 */

import { AdHandler, AdInvokeResult, AdParam, AdType } from '../../Types'
import OppoBaseAd from './OppoBaseAd'
import log from "./OppoLog"

export default class OppoBoxPortalAd extends OppoBaseAd {
  constructor(...ids: any[]) {
    super(AdType.Portal,...ids)
  }
  protected createAd(_id: string): any {
    if (globalThis.qg.createGamePortalAd) {
      if (!this.ad) {
        return globalThis.qg.createGamePortalAd({
          adUnitId: _id,
        })
      }
      return this.ad
    }
    log('不支持的盒子广告类型')
  }
 
  // protected onClose(res: any): void {
  //   if (this.isDestroyed) return
  //   this.isShowed = false
  //   // 当九宫格关闭之后，再次展示Icon
  //   this.ad.show().then(() => {
  //     this.isShowed = true
  //   })
  // }
  // // 场景切换等需要关闭时调用
  // public destroy(): void {
  //   super.destroy()
  //   this.isDestroyed = true
  // }
}
