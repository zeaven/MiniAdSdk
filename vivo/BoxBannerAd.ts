/**
 * 原生模板广告
 */

import BaseAd from './BaseAd'
import VivoAd from './VivoAd'

export default class BoxBannerAd extends BaseAd {
  protected name: string = '盒子横幅广告'
  protected createInterval = 1000
  protected createAd(_id: string): any {
    if (qg.createBoxBannerAd) {
      return qg.createBoxBannerAd({
        posId: _id,
        ...this.properties
      })
    }
    VivoAd.log('不支持的盒子广告类型')
  }

}
