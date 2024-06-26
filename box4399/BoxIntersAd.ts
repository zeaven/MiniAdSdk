import BoxBaseAd from "./BoxBaseAd";

export default class BoxIntersAd extends BoxBaseAd {
  protected createAd(attrs?: Object) {
    return globalThis.gamebox.createInterstitialAd();
  }

}
