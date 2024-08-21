/**
 * 插屏广告
 */

import AliBaseAd from "./AliBaseAd";

export default class AliIntersAd extends AliBaseAd {
  protected get name(): string { return '插屏' }
  protected createAd(_id: string): any {
    return my.createInterstitialAd({
      adUnitId: _id,
    })
  }
}
