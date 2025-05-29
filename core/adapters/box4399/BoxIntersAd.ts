import { AdType } from "../../Types";
import BoxBaseAd from "./BoxBaseAd";

export default class BoxIntersAd extends BoxBaseAd {
  protected type: AdType = AdType.Interstitial;
  protected createAd(id: string) {
    return globalThis.gamebox.createInterstitialAd();
  }

}
