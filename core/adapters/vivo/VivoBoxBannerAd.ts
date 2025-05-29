/**
 * 原生模板广告
 */

import { AdType } from '../../Types'
import VivoBaseAd from './VivoBaseAd'
import log from "./VivoLog"

export default class ViviBoxBannerAd extends VivoBaseAd {
  protected type: AdType = AdType.Box
  protected createAd(_id: string): any {
    if (globalThis.qg.createBoxBannerAd) {
      this.ready = true // 默认加载
      return globalThis.qg.createBoxBannerAd({
        posId: _id,
        ...this.properties
      })
    }
    log('不支持的盒子广告类型')
  }

}
