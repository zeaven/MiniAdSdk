

import { AdType } from "../../Types"
import HwNativeAd from "./HwNativeAd"


export default class HwNativeIconAd extends HwNativeAd {
  constructor(...ids: any[]) {
    super(AdType.NativeIcon,...ids)
  }
}
