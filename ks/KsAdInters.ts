import KsAdBase from "./KsAdBase";

export default class KsAdInters extends KsAdBase {
  protected name: string = '插屏广告'
  protected createAd(_id: string) {
    if (!this.ad) {
      return globalThis.ks.createInterstitialAd({
        adUnitId: _id,
      })
    }
    return this.ad
  }
  
}
