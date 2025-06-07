/**
 * 插屏广告
 */

import { AdType } from "../../Types";
import AliBaseAd from "./AliBaseAd";

export default class AliIntersAd extends AliBaseAd {
  constructor(...ids: any[]) {
    super(AdType.Interstitial,...ids)
  }
  protected createAd(_id: string): any {
    return my.createInterstitialAd({
      adUnitId: _id,
    })
  }
}
