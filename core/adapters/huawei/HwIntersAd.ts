import { AdType } from "../../Types";
import HwBaseAd from "./HwBaseAd";

export default class HwIntersAd extends HwBaseAd {
  constructor(...ids: any[]) {
    super(AdType.Interstitial, ...ids)
  }

  protected createAd(_id: string): any {
    return qg.createInterstitialAd({
      adUnitId: _id,
    })
  }
}
