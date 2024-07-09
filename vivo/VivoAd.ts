/**
 * VIVO广告
 */

import { AdHandler, AdInterface, AdInvokeResult, AdParam, IAdConfig } from "../Types"
import { get_log, LogHandle } from "../utils/Log";
import VivoBannerAd from "./VivoBannerAd";
import VivoRewardAd from "./VivoRewardAd";
import VivoIntersAd from "./VivoIntersAd";
import VivoCustomAd from "./VivoCustomAd";
import VivoBoxBannerAd from './VivoBoxBannerAd'
import VivoBoxPortalAd from "./VivoBoxPortalAd";


export default class VivoAd implements AdInterface {
  public static log: LogHandle = get_log('VivoAd')
  private systemInfo!: any
  private _banner?: AdHandler
  private _inters?: AdHandler
  private _reward?: AdHandler
  private _custom?: AdHandler
  private _box_banner?: AdHandler
  private _box_portal?: AdHandler
  private _native?: AdHandler
  config: IAdConfig;

  constructor(config: IAdConfig) {
    this.config = config
  }

  init(): void {
    this.systemInfo = globalThis.qg.getSystemInfoSync()
    VivoAd.log('init', JSON.stringify(this.systemInfo))

    this.initAds()
  }
  private initAds(): void {
    if (this.systemInfo.platformVersionCode >= 1031) {
		  this._banner = new VivoBannerAd(...this.config.BANNER_ID)
		  this._inters = new VivoIntersAd(...this.config.INTERS_ID)
    }

    if (this.systemInfo.platformVersionCode >= 1041)
		  this._reward = new VivoRewardAd(...this.config.REWARD_ID)
    if (this.systemInfo.platformVersionCode >= 1091)
      this._custom = new VivoCustomAd(...this.config.CUSTOM_ID)
    if (this.systemInfo.platformVersionCode >= 1092) {
		  this._box_banner = new VivoBoxBannerAd(...this.config.BOX_ID)
		  this._box_portal = new VivoBoxPortalAd(...this.config.PORTAL_ID)
    }
  }
  private showAd(
    adName: string,
    ad?: AdHandler,
    param?: AdParam
  ): Promise<AdInvokeResult> {
    if (ad) {
      VivoAd.log(`广告${adName}被调用`)
      return ad.show(param)
    } else {
      VivoAd.log(`广告${adName}未初始化`)
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
    return this.showAd( '原生模板广告', this._custom, param)
  }
  hideCustom(param?: AdParam): Promise<AdInvokeResult> {
    this._custom && this._custom.close()
    return Promise.reject(false)
  }
  showToast(msg: string, duration: number): void {
      globalThis.qg.showToast({message: msg, duration: 0})
  }
}
