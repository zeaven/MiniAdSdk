/**
 * 原生模板广告
 */

import VivoBaseAd from './VivoBaseAd'

export default class VivoCustomAd extends VivoBaseAd {
  protected get name(): string { return '原生模板' }
  protected createInterval = 1000
  public get isShowed(): boolean {
    return this.ad ? this.ad.isShow() : false
  }
  protected set isShowed(val: boolean) {}
  protected createAd(_id: string): any {
    if (globalThis.qg.createCustomAd)
      return globalThis.qg.createCustomAd({
        posId: _id,
        style:{
          gravity: 'center'
        },
        ...this.properties
      })
  }
}
