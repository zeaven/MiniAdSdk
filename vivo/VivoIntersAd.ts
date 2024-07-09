/**
 * 插屏广告
 */

import VivoBaseAd from "./VivoBaseAd";

export default class VivoInsertAd extends VivoBaseAd {
  protected name: string = '插屏广告'
  protected createAd(_id: string): any {
    return globalThis.qg.createInterstitialAd({
      posId: _id,
    })
  }

}
