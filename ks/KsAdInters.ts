import KsAdBase from "./KsAdBase";

export default class KsAdInters extends KsAdBase {
  protected get name(): string { return '插屏' }
  protected createAd(_id: string) {
    if (!this.ad) {
      return globalThis.ks.createInterstitialAd({
        adUnitId: _id,
      })
    }
    return this.ad
  }
  
}
