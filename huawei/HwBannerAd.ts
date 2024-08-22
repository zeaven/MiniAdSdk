import HwBaseAd from "./HwBaseAd";

export default class HwBannerAd extends HwBaseAd {
  protected get name(): string { return 'Banner' }

  protected createAd(_id: string): any {
    const bannerTop = this.properties.safeArea.height
    return qg.createBannerAd({
      adUnitId: _id,
      adIntervals: 30,
      style: {
        //top需要手机屏幕高度减去广告本身高度
        top:bannerTop-57,
        left:0,
        height:57,
        width:360,
      }
    })
  }
}
