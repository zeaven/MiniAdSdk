import HwBaseAd from "./HwBaseAd";

export default class HwBannerAd extends HwBaseAd {
  get name(): string { return 'Banner' }

  protected createAd(_id: string): any {
    const bannerTop = this.properties.safeArea.height + this.properties.safeArea.top
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

  protected onLoad(res?: any): void {
    // 因为banner广告是通过show拉取的，所以onLoad里面重新执行onShow，保证事件顺序一致
    super.onLoad(res)
    super.onShow()
  }

  protected onShow(): void {
    // 取消默认的onShow事件，改为加载超时，且超时后要重新调用 show，因为banner广告是通过show拉取的
    this.setLoadTimeout(10000).then(() => {
      this.show({})
    })
  }
}
