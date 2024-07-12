/**
 * 原生模板广告
 */

import VivoBaseAd from './VivoBaseAd'
import VivoAd from './VivoAd'

export default class ViviBoxBannerAd extends VivoBaseAd {
  protected get name(): string { return '盒子横幅' }
  protected createInterval = 1000
  protected createAd(_id: string): any {
    if (globalThis.qg.createBoxBannerAd) {
      return globalThis.qg.createBoxBannerAd({
        posId: _id,
        ...this.properties
      })
    }
    VivoAd.log('不支持的盒子广告类型')
  }

}
