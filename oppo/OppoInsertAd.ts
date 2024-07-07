/**
 * 插屏广告
 */

import OppoBaseAd from "./OppoBaseAd";

export default class OppoInsertAd extends OppoBaseAd {
  protected get name(): string {
      return '插屏广告'
  }
  protected createAd(_id: string): any {
    return globalThis.qg.createInterstitialAd({
      adUnitId: _id,
    })
  }

}
