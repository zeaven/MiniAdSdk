/**
 * 插屏广告
 */

import { AdType } from "../../Types";
import OppoBaseAd from "./OppoBaseAd";

export default class OppoIntersAd extends OppoBaseAd {
  constructor(...ids: any[]) {
    super(AdType.Interstitial,...ids)
  }
  // 可复用
  protected autoDestroy: boolean = false
  protected createAd(_id: string): any {
    return globalThis.qg.createInterstitialAd({
      adUnitId: _id,
    })
  }

}
