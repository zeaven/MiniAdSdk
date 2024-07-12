/**
 * 插屏广告
 */

import VivoBaseAd from "./VivoBaseAd";

export default class VivoInsertAd extends VivoBaseAd {
  protected get name(): string { return '插屏' }
  protected createAd(_id: string): any {
    return globalThis.qg.createInterstitialAd({
      posId: _id,
    })
  }

}
