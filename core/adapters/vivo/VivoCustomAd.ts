/**
 * 原生模板广告
 */

import VivoBaseAd from './VivoBaseAd'

export default class VivoCustomAd extends VivoBaseAd {
  get name(): string { return '原生模板' }
  protected createInterval = 1000

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
