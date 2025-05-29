/**
 * Banner广告
 */

import { AdType } from "../../Types";
import VivoBaseAd from "./VivoBaseAd";

export default class VivoBannerAd extends VivoBaseAd {
  protected type: AdType = AdType.Banner
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
