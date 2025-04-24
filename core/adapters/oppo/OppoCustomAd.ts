/**
 * 原生模板广告
 */

import OppoBaseAd from './OppoBaseAd'

export default class OppoCustomAd extends OppoBaseAd {
  get name(): string {
      return '原生模板广告'
  }
  protected createInterval = 1000
  
  protected createAd(_id: string): any {
    if (globalThis.qg.createCustomAd)
      return globalThis.qg.createCustomAd({
        adUnitId: _id,
        ...this.properties
      })
  }
}
