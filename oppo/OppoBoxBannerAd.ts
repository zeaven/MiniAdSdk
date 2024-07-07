/**
 * 原生模板广告
 */

import OppoBaseAd from './OppoBaseAd'
import OppoAd from './OppoAd'

export default class OppoBoxBannerAd extends OppoBaseAd {
  protected get name(): string {
      return '盒子横幅广告'
  }
  protected createInterval = 1000
  protected createAd(_id: string): any {
    if (globalThis.qg.createBoxBannerAd) {
      return globalThis.qg.createBoxBannerAd({
        adUnitId: _id,
        ...this.properties
      })
    }
    OppoAd.log('不支持的盒子广告类型')
  }

}
