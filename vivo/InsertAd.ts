/**
 * 插屏广告
 */

import BaseAd from "./BaseAd";

export default class InsertAd extends BaseAd {
  protected name: string = '插屏广告'
  protected createAd(_id: string): any {
    return qg.createInterstitialAd({
      posId: _id,
    })
  }

}
