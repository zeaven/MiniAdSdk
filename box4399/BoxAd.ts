import { AdHandler, AdInterface, AdInvokeResult, AdParam } from "../Types";
import { LogHandle, get_log } from "../utils/Log";
import BoxBannerAd from "./BoxBannerAd";
import BoxIntersAd from "./BoxIntersAd";
import BoxRewardAd from "./BoxRewardAd";

export default class BoxAd implements AdInterface {
  public static log: LogHandle = get_log('4399Ad')
  systemInfo: any;
  private _banner: BoxBannerAd;
  private _reward: BoxRewardAd;
  private _insert: BoxIntersAd;

  init(): void {
    this.systemInfo = globalThis.gamebox.getSystemInfoSync()
   this.initAds()
  }
  private initAds(): void {
    const pixelRatio = this.systemInfo.pixelRatio;
    const width = 320 * pixelRatio;
    const height = 50 * pixelRatio;
    const bannerLeft = (this.systemInfo.screenWidth * pixelRatio - width)/2;
    const bannerTop = this.systemInfo.screenHeight * pixelRatio - height;
    this._banner = new BoxBannerAd({width, height, bannerLeft, bannerTop})
    this._insert = new BoxIntersAd()
    this._reward = new BoxRewardAd()
  }
  private showAd(
    adName: string,
    ad?: AdHandler,
    param?: AdParam
  ): Promise<AdInvokeResult> {
    if (ad) {
      BoxAd.log(`广告${adName}被调用`)
      return ad.show(param)
    } else {
      BoxAd.log(`广告${adName}未初始化`)
      return Promise.reject(adName + '无效')
    }
  }
  showBox(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('banner广告',null, param)
  }
  showBanner(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('banner广告',this._banner, param)
  }
  hideBanner(param?: AdParam): Promise<AdInvokeResult> {
    this._banner && this._banner.close()
    return Promise.reject(false)
  }
  showInsert(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('插屏广告', this._insert, param)
  }
  showReward(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('激励视频广告广告', this._reward, param)
  }
  showNative(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd( '原生自渲染广告', null, param)
  }
  showCustom(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd( '原生自渲染广告', null, param)
  }
  hideCustom(param?: AdParam): Promise<AdInvokeResult> {
    // this._custom && this._custom.close()
    return Promise.reject(false)
  }
  showToast(msg: string, duration: number): void {
    globalThis.gamebox.showToast({
      title: msg,
      duration: duration?? 1500
    })
  }

}
