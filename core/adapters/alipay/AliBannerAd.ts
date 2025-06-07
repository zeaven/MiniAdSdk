/**
 * Banner广告
 */

import { AdType } from "../../Types";
import AliBaseAd from "./AliBaseAd";

export default class AliBannerAd extends AliBaseAd {
  constructor(...ids: any[]) {
    super(AdType.Banner,...ids)
  }
  protected createAd(_id: string): any {
    return my.createBannerAd({
      adUnitId: _id,
      left: 0,
      top: 0,
      width: 750,
    })
  }
}
