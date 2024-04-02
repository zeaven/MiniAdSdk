/**
 * 原生模板广告
 */

import { AdHandler, AdInvokeResult, AdParam } from '../Types'
import VivoBaseAd from './VivoBaseAd'
import VivoAd from './VivoAd'

export default class VivoBoxPortalAd extends VivoBaseAd {
  protected name: string = '盒子九宫格广告'
  protected createInterval = 1000
  private isDestroyed = false
  protected autoLoad = false
  protected createAd(_id: string): any {
    if (globalThis.qg.createBoxPortalAd) {
      if (this.isDestroyed || !this.ad) {
        this.isDestroyed = false
        return globalThis.qg.createBoxPortalAd({
          posId: _id,
          ...this.properties
        })
      }
    }
    VivoAd.log('不支持的盒子广告类型')
  }
  public show(param: AdParam): Promise<AdInvokeResult> {
    if (this.isDestroyed) this.loadAd()
    return super.show(param)
  }


  protected onClose(res: any): void {
    if (this.isDestroyed) return
    this.isShowed = false
    // 当九宫格关闭之后，再次展示Icon
    this.ad.show().then(() => {
      this.isShowed = true
    })
  }
  // 场景切换等需要关闭时调用
  public destroy(): void {
    super.destroy()
    this.isDestroyed = true
  }
}
