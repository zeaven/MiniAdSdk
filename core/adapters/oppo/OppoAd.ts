/**
 * VIVO广告
 */

import { AdHandler, AdInitConfig, AdInterface, AdInvokeResult, AdParam, AdSession, IAdConfig } from "../../Types"
import log from "./OppoLog"
import OppoBannerAd from "./OppoBannerAd";
import OppoBoxBannerAd from "./OppoBoxBannerAd";
import OppoBoxPortalAd from "./OppoBoxPortalAd";
import OppoCustomAd from "./OppoCustomAd";
import OppoIntersAd from "./OppoIntersAd";
import OppoRewardAd from "./OppoRewardAd";
import OppoBoxDrawerAd from "./OppoBoxDrawerAd";


export default class OppoAd implements AdInterface {

  private systemInfo!: any
  private _banner?: AdHandler
  private _inters?: AdHandler
  private _reward?: AdHandler
  private _custom?: AdHandler
  private _box_banner?: AdHandler
  private _box_portal?: AdHandler
  private _native?: AdHandler
  config: AdInitConfig;

  constructor (config: AdInitConfig) {
    this.config = config
  }

  init(initConfig: AdInitConfig): void {
    this.systemInfo = globalThis.qg.getSystemInfoSync()
    log('init', JSON.stringify(this.systemInfo))
    this.config = initConfig
    this.initAds()
  }
  private initAds(): void {
    if (this.systemInfo.platformVersionCode >= 1051) {
		  this._banner = new OppoBannerAd(...this.config.adConfig.BANNER_ID, this.systemInfo)
      this._reward = new OppoRewardAd(...this.config.adConfig.REWARD_ID)
    }

    if (this.systemInfo.platformVersionCode >= 1061)
		  this._inters = new OppoIntersAd(...this.config.adConfig.INTERS_ID)
    if (this.systemInfo.platformVersionCode >= 1103)
      this._custom = new OppoCustomAd(...this.config.adConfig.CUSTOM_ID, this.systemInfo)
    if (this.systemInfo.platformVersionCode >= 1076) {
		  this._box_banner = new OppoBoxBannerAd(...this.config.adConfig.BOX_ID)
		  this._box_portal = new OppoBoxPortalAd(...this.config.adConfig.PORTAL_ID)
    }
    if (this.systemInfo.platformVersionCode >= 1090) {
      this._native = new OppoBoxDrawerAd(...this.config.adConfig.DRAWER_ID, this.systemInfo)
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
    let boxAd: AdHandler|undefined
    if (param) {
      if (param.type === 0) boxAd = this._box_banner
      if (param.type === 1) boxAd = this._box_portal
    }
    return this.showAd('盒子广告', boxAd, param)
  }
  showBanner(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('banner广告',this._banner, param)
  }
  hideBanner(param?: AdParam): Promise<void> {
    this._banner && this._banner.close()
    return Promise.resolve()
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
  hideNative(param?: AdParam): Promise<void> {
    this._native && this._native.close()
    return Promise.resolve()
  }
  showCustom(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd( '原生模板广告', this._custom, param)
  }
  hideCustom(param?: AdParam): Promise<void> {
    this._custom && this._custom.close()
    return Promise.resolve()
  }
  showToast(msg: string, duration: number): void {
      globalThis.qg.showToast({message: msg, duration: 0})
  }
}
