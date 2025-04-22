/**
 * Banner广告
 */

import TTBaseAd from './TTBaseAd'

export default class TTBannerAd extends TTBaseAd {
  protected get name(): string { return 'banner' }

  protected createAd(_id: string): any {
    return globalThis.tt.createBannerAd({
      adUnitId: _id,
      ...this.properties
    })
  }
}
