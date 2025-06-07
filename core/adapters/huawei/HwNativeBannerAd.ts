

import { AdType } from "../../Types"
import HwNativeAd from "./HwNativeAd"


export default class HwNativeBannerAd extends HwNativeAd {
  constructor(...ids: any[]) {
    super(AdType.NativeBanner, ...ids)
  }

}
