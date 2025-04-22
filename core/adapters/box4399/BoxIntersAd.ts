import BoxBaseAd from "./BoxBaseAd";

export default class BoxIntersAd extends BoxBaseAd {
  protected get name(): string { return '插屏' }
  protected createAd(attrs?: Object) {
    return globalThis.gamebox.createInterstitialAd();
  }

}
