/**
 * 华为广告
 */

import { AdEventType, AdHandler, AdInitConfig, AdInterface, AdInvokeResult, AdParam, IAdConfig, ILoginable, LoginResult } from "../../Types";
import HwBannerAd from "./HwBannerAd";
import HwIntersAd from "./HwIntersAd";
import HwNativeAd from "./HwNativeAd";
import HwRewardAd from "./HwRewardAd";
import log from "./HwLog"
import HwLogin from "./HwLogin";
import AdEventBus from "../../utils/AdEventBus";

export default class HuaweiAd implements AdInterface, ILoginable {
  
  private systemInfo!: {
    brand: string;
    model: string;
    // 其他需要的属性...
  }
  private _banner?: AdHandler
  private _inters?: AdHandler
  private _native?: AdHandler
  private _reward?: AdHandler
  private _box: AdHandler
  config: AdInitConfig

  constructor(config: AdInitConfig) {
    this.config = config
  }
  login(): Promise<LoginResult> {
    return HwLogin.login(this.config)
  }
  needPrivacy(): boolean {
    return true
  }
  
  /**
   * systemInfo: {"brand":"HUAWEI","model":"PAR-LX1","pixelRatio":1,"screenWidth":1080,"screenHeight":2340,"windowWidth":1080,"windowHeight":2340,"language":"zh","region":"CN","script":"Hans","coreVersion":"1.1.21","COREVersion":"1.1.21","system":"Android 9","platform":"ANDROIDOS","version":"4.6.1.300","statusBarHeight":88,"platformVersionName":"1.119","platformVersionCode":1119,"safeArea":{"bottom":780,"left":0,"right":360,"top":29.333333333333332,"height":750.6666666666666,"width":360}}
   * @param initConfig 
   */
  init(initConfig: AdInitConfig): void {
    this.systemInfo = qg.getSystemInfoSync()
    log('init', this.systemInfo)
    this.config = initConfig
    this.initAds()
  }
  private initAds(): void {
    if (this.config.adConfig.INTERS_ID.length > 0) {
      this._inters = new HwIntersAd(...this.config.adConfig.INTERS_ID)
    }
    if (this.config.adConfig.BANNER_ID.length > 0) {
      this._banner = new HwBannerAd(...this.config.adConfig.BANNER_ID, {
        systemInfo: this.systemInfo,
        remoteAdConfigData: this.config.remoteAdConfigData
      })
    }
    if (this.config.adConfig.REWARD_ID.length > 0) {
      this._reward = new HwRewardAd(...this.config.adConfig.REWARD_ID)
    }
    if (this.config.adConfig.NATIVE_ID.length > 0) {
      this._native = new HwNativeAd(...this.config.adConfig.NATIVE_ID, this.systemInfo)
    }
  }
  private showAd(
    adName: string,
    ad?: AdHandler,
    param?: AdParam
  ): Promise<AdInvokeResult> {
    if (ad) {
      log(`广告${adName}被调用`)
      return ad.show(param)
    } else {
      log(`广告${adName}未初始化`)
      return Promise.reject(adName + '无效')
    }
  }
  showBox(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('盒子广告',this._box, param)
  }
  showBanner(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('banner广告',this._banner, param)
  }
  hideBanner(param?: AdParam): Promise<AdInvokeResult> {
    this._banner && this._banner.close()
    return Promise.reject(false)
  }
  showInters(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('插屏广告', this._inters, param)
  }
  showReward(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('激励视频广告广告', this._reward, param)
  }
  showNative(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd( '原生自渲染广告', this._native, param)
  }
  showCustom(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd( '原生模板广告', undefined, param)
  }
  hideCustom(param?: AdParam): Promise<AdInvokeResult> {
    return Promise.reject(false)
  }
  showToast(msg: string, duration: number): void {
      !!msg && qg.showToast({title: msg, duration: duration ?? 1500})
  }
}
