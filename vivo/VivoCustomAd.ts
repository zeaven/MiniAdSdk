/**
 * 原生模板广告
 */

import VivoBaseAd from './VivoBaseAd'

export default class VivoCustomAd extends VivoBaseAd {
  protected name: string = '原生模板广告'
  protected createInterval = 1000
  protected get isShowed(): boolean {
    return this.ad ? this.ad.isShow() : false
  }
  protected set isShowed(val: boolean) {}
  protected createAd(_id: string): any {
    if (qg.createCustomAd)
      return qg.createCustomAd({
        posId: _id,
        style:{
          gravity: 'center'
        },
        ...this.properties
      })
  }
}
