import { AdHandler, AdInitConfig, AdInterface, AdInvokeResult, AdParam, AdType, IAdConfig } from "../../Types";
import log from "./BoxLog"
import BoxBannerAd from "./BoxBannerAd";
import BoxIntersAd from "./BoxIntersAd";
import BoxRewardAd from "./BoxRewardAd";

export default class Box4399Ad implements AdInterface {
  systemInfo: any;
  private _banner: BoxBannerAd;
  private _reward: BoxRewardAd;
  private _inters: BoxIntersAd;
  config: AdInitConfig;

  constructor (config: AdInitConfig) {
    this.config = config
  }


  init(initConfig: AdInitConfig): void {
    this.systemInfo = globalThis.gamebox.getSystemInfoSync()
    log('init', JSON.stringify(this.systemInfo))
    this.config = initConfig
    this.initAds()
  }
  private initAds(): void {
    const pixelRatio = this.systemInfo.pixelRatio;
    const width = 320 * pixelRatio;
    const height = 50 * pixelRatio;
    const bannerLeft = (this.systemInfo.screenWidth * pixelRatio - width)/2;
    const bannerTop = this.systemInfo.screenHeight * pixelRatio - height;
    this._banner = new BoxBannerAd({width, height, bannerLeft, bannerTop})
    this._inters = new BoxIntersAd()
    this._reward = new BoxRewardAd()
  }
  private showAd(
    adName: AdType,
    ad?: AdHandler | null,
    param?: AdParam
  ): Promise<AdInvokeResult> {
    if (ad) {
      log(`广告${AdType[adName]}被调用`)
      return ad.show(param)
    } else {
      log(`广告${AdType[adName]}未初始化`)
      return Promise.reject(AdType[adName] + '无效')
    }
  }
  showBox(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd(AdType.Box,null, param)
  }
  showBanner(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd(AdType.Banner,this._banner, param)
  }
  hideBanner(param?: AdParam): Promise<void> {
    this._banner && this._banner.close()
    return Promise.resolve()
  }
  showInters(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd(AdType.Interstitial, this._inters, param)
  }
  showReward(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd(AdType.Reward, this._reward, param)
  }
  showNative(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd(AdType.Native, null, param)
  }
  hideNative(param?: AdParam): Promise<void> {
    return Promise.reject('暂不支持')
  }
  showCustom(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd(AdType.Custom, null, param)
  }
  hideCustom(param?: AdParam): Promise<void> {
    // this._custom && this._custom.close()
    return Promise.reject('暂不支持')
  }
  showToast(msg: string, duration: number): void {
    globalThis.gamebox.showToast({
      title: msg,
      duration: duration?? 1500
    })
  }

}
