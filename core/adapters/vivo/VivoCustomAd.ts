/**
 * 原生模板广告
 */

import { AdType } from '../../Types'
import VivoBaseAd from './VivoBaseAd'

export default class VivoCustomAd extends VivoBaseAd {
  constructor(...ids: any[]) {
    super(AdType.Custom,...ids)
  }

  protected createAd(_id: string): any {
    if (globalThis.qg.createCustomAd)
      this.ready = true // 默认加载
      return globalThis.qg.createCustomAd({
        posId: _id,
        style:{
          gravity: 'center'
        },
      })
  }
}
