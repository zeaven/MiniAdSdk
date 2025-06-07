import { AdType } from "../../Types";
import BoxBaseAd from "./BoxBaseAd";

export default class BoxIntersAd extends BoxBaseAd {
  constructor(...ids: any[]) {
    super(AdType.Interstitial, ...ids);
  }
  protected createAd(id: string) {
    return globalThis.gamebox.createInterstitialAd();
  }

}
