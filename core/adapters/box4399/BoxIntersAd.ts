import BoxBaseAd from "./BoxBaseAd";

export default class BoxIntersAd extends BoxBaseAd {
  get name(): string { return '插屏' }
  protected createAd(attrs?: Object) {
    return globalThis.gamebox.createInterstitialAd();
  }

}
