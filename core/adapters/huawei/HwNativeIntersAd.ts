

import { AdType } from "../../Types"
import HwNativeAd from "./HwNativeAd"


export default class HwNativeIntersAd extends HwNativeAd {
  constructor(...ids: any[]) {
    super(AdType.NativeInterstitial,...ids)
  }
}
