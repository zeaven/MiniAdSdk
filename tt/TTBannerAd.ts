/**
 * Banner广告
 */

import TTBaseAd from './TTBaseAd'

export default class TTBannerAd extends TTBaseAd {
  protected name: string = 'banner广告'

  protected createAd(_id: string): any {
    return tt.createBannerAd({
      posId: _id,
      ...this.properties
    })
  }
}
