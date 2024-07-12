import BoxBaseAd from "./BoxBaseAd";

export default class BoxBannerAd extends BoxBaseAd {
  protected get name(): string { return 'banner' }
  protected createAd(attrs?: any) {
    return globalThis.gamebox.createBannerAd({style:{
      width : attrs.width,
      height : attrs.height,
      left : attrs.bannerLeft,
      top : attrs.bannerTop 
    }});
  }

}
