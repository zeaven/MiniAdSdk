/**
 * 华为广告
 */

import { AdHandler, AdInitConfig, AdInterface, AdInvokeResult, AdParam, IAdConfig } from "../../Types";
import { LogHandle, get_log } from "../../utils/Log";
import HwBannerAd from "./HwBannerAd";
import HwIntersAd from "./HwIntersAd";
import HwNativeAd from "./HwNativeAd";
import HwRewardAd from "./HwRewardAd";
import log from "./HwLog"

export default class HuaweiAd implements AdInterface {

  
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
  config: IAdConfig

  constructor(config: IAdConfig) {
    this.config = config
  }
  
  init(initConfig: AdInitConfig): void {
    this.systemInfo = qg.getSystemInfoSync()
    log('init', JSON.stringify(this.systemInfo))
    this.config = initConfig.adConfig
    this.initAds()
  }
  private initAds(): void {
		  this._banner = new HwBannerAd(...this.config.BANNER_ID)
		  this._inters = new HwIntersAd(...this.config.INTERS_ID)
      this._native = new HwNativeAd(...this.config.NATIVE_ID)
		  this._reward = new HwRewardAd(...this.config.REWARD_ID)
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
