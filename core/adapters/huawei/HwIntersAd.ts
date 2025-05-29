import { AdType } from "../../Types";
import HwBaseAd from "./HwBaseAd";

export default class HwIntersAd extends HwBaseAd {
  protected type: AdType = AdType.Interstitial;

  protected createAd(_id: string): any {
    return qg.createInterstitialAd({
      adUnitId: _id,
    })
  }
}
