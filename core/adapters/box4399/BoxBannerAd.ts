import { AdType } from "../../Types";
import BoxBaseAd from "./BoxBaseAd";

export default class BoxBannerAd extends BoxBaseAd {
  constructor(...ids: any[]) {
    super(AdType.Banner, ...ids);
  }
  protected createAd(id: string) {
    return globalThis.gamebox.createBannerAd({style:{
      width : this.properties?.width,
      height : this.properties?.height,
      left : this.properties?.bannerLeft,
      top : this.properties?.bannerTop 
    }});
  }

}
