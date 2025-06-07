/**
 * Banner广告
 */

import { AdType } from '../../Types'
import TTBaseAd from './TTBaseAd'

export default class TTBannerAd extends TTBaseAd {
  constructor (...ids: any[]) {
    super(AdType.Banner, ...ids)
  }

  protected createAd(_id: string): any {
    return globalThis.tt.createBannerAd({
      adUnitId: _id,
      ...this.properties
    })
  }
}
