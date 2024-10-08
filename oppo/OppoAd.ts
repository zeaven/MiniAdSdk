/**
 * VIVO广告
 */

import { AdHandler, AdInterface, AdInvokeResult, AdParam, AdSession, IAdConfig } from "../Types"
import { get_log, LogHandle } from "../utils/Log";
import OppoBannerAd from "./OppoBannerAd";
import OppoBoxBannerAd from "./OppoBoxBannerAd";
import OppoBoxPortalAd from "./OppoBoxPortalAd";
import OppoCustomAd from "./OppoCustomAd";
import OppoIntersAd from "./OppoIntersAd";
import OppoRewardAd from "./OppoRewardAd";


const BANNER_AD_ID = ['1557678']
const INTERS_AD_ID = ['']
const REWARD_AD_ID = ['1557681']
const CUSTOM_AD_ID = ['']
const BANNER_BOX_AD_ID = ['']

export default class OppoAd implements AdInterface {
  public static log: LogHandle = get_log('OppoAd')
  private systemInfo!: any
  private _banner?: AdHandler
  private _inters?: AdHandler
  private _reward?: AdHandler
  private _custom?: AdHandler
  private _box_banner?: AdHandler
  private _box_portal?: AdHandler
  private _native?: AdHandler
  config: IAdConfig;

  constructor (config: IAdConfig) {
    this.config = config
  }

  init(): void {
    this.systemInfo = globalThis.qg.getSystemInfoSync()
    OppoAd.log('init', JSON.stringify(this.systemInfo))

    this.initAds()
  }
  private initAds(): void {
    if (this.systemInfo.platformVersionCode >= 1051) {
		  this._banner = new OppoBannerAd(...this.config.BANNER_ID)
      this._reward = new OppoRewardAd(...this.config.REWARD_ID)
    }

    if (this.systemInfo.platformVersionCode >= 1061)
		  this._inters = new OppoIntersAd(...this.config.INTERS_ID)
    if (this.systemInfo.platformVersionCode >= 1103)
      this._custom = new OppoCustomAd(...this.config.CUSTOM_ID, {
        style: {//开发者自行设置
              top: 0,
              left: 0,
              width: this.systemInfo.screenWidth,
            }
    })
    if (this.systemInfo.platformVersionCode >= 1076) {
		  this._box_banner = new OppoBoxBannerAd(...this.config.BOX_ID)
		  this._box_portal = new OppoBoxPortalAd(...this.config.PORTAL_ID)
    }
  }
  private showAd(
    adName: string,
    ad?: AdHandler,
    param?: AdParam
  ): Promise<AdInvokeResult> {
    if (ad) {
      OppoAd.log(`广告${adName}被调用`)
      return ad.show(param)
    } else {
      OppoAd.log(`广告${adName}未初始化`)
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
