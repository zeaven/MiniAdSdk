/**
 * 插屏广告
 */

import VivoBaseAd from "./VivoBaseAd";

export default class VivoInsertAd extends VivoBaseAd {
  get name(): string { return '插屏' }
  protected createAd(_id: string): any {
    this.ready = true // 默认加载
    return globalThis.qg.createInterstitialAd({
      posId: _id,
    })
  }

}
