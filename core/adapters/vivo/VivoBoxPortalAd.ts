/**
 * 原生模板广告
 */

import { AdType } from '../../Types'
import VivoBaseAd from './VivoBaseAd'
import log from "./VivoLog"

export default class VivoBoxPortalAd extends VivoBaseAd {
  protected type: AdType = AdType.Portal
  protected createInterval = 1000
  protected createAd(_id: string): any {
    if (globalThis.qg.createBoxPortalAd) {
      if (!this.ad) {
        this.ready = true // 默认加载
        return globalThis.qg.createBoxPortalAd({
          posId: _id,
        })
      }
    }
    log('不支持的盒子广告类型')
  }

  protected onLoad(res?: any): void {
    super.onLoad(res)
    this.show({})
  }
}
