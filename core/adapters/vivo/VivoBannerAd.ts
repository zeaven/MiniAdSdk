/**
 * Banner广告
 */

import VivoBaseAd from "./VivoBaseAd";

export default class VivoBannerAd extends VivoBaseAd {
  get name(): string { return 'banner' }
  protected createAd(_id: string): any {
    this.ready = true // 默认加载
    return globalThis.qg.createBannerAd({
      posId: _id,
      style: {
        left: 0,
        top: this.properties.safeArea.height
      }
    })
  }
  
}
