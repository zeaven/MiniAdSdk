/**
 * 原生模板广告
 */

import OppoBaseAd from './OppoBaseAd'
import log from "./OppoLog"

export default class OppoBoxBannerAd extends OppoBaseAd {
  get name(): string {
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
    log('不支持的盒子广告类型')
  }

}
