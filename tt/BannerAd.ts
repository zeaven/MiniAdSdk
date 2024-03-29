/**
 * Banner广告
 */

import BaseAd from './BaseAd'

export default class BannerAd extends BaseAd {
  protected name: string = 'banner广告'

  protected createAd(_id: string): any {
    return tt.createBannerAd({
      posId: _id,
    })
  }
}
