/**
 * 插屏广告
 */

import { AdType } from "../../Types";
import VivoBaseAd from "./VivoBaseAd";

export default class VivoInsertAd extends VivoBaseAd {
  protected type: AdType = AdType.Interstitial
  protected createAd(_id: string): any {
    this.ready = true // 默认加载
    return globalThis.qg.createInterstitialAd({
      posId: _id,
    })
  }

}
