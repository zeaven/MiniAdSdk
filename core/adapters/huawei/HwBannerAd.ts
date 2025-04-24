import HwBaseAd from "./HwBaseAd";

export default class HwBannerAd extends HwBaseAd {
  get name(): string { return 'Banner' }

  protected createAd(_id: string): any {
    const bannerTop = this.properties.safeArea.height
    this.ready = true // 华为banner广告通过show拉取，默认是ready状态
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
