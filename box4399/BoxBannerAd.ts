import BoxBaseAd from "./BoxBaseAd";

export default class BoxBannerAd extends BoxBaseAd {
  protected createAd(attrs?: Object) {
    return globalThis.gamebox.createBannerAd({style:{
      width : attrs.width,
      height : attrs.height,
      left : attrs.bannerLeft,
      top : attrs.bannerTop 
    }});
  }

}
