/**
 * Banner广告
 */

import AliBaseAd from "./AliBaseAd";

export default class AliBannerAd extends AliBaseAd {
  protected get name(): string { return 'Banner' }
  protected createAd(_id: string): any {
    return my.createBannerAd({
      adUnitId: _id,
      left: 0,
      top: 0,
      width: 750,
    })
  }
}
