/**
 * VIVO广告
 */

import { AdHandler, AdInterface, AdInvokeResult, AdParam } from "../Types"
import { get_log, LogHandle } from "../Log";
import BannerAd from "./BannerAd";
import RewardAd from "./RewardAd";
import InsertAd from "./InsertAd";
import CustomAd from "./CustomAd";
import BoxBannerAd from './BoxBannerAd'
import BoxPortalAd from "./BoxPortalAd";

export default class VivoAd implements AdInterface {
  public static log: LogHandle = get_log('VivoAd')
  private systemInfo!: any
  private _banner?: AdHandler
  private _insert?: AdHandler
  private _reward?: AdHandler
  private _custom?: AdHandler
  private _box_banner?: AdHandler
  private _box_portal?: AdHandler
  private _native?: AdHandler

  init(): void {
    this.systemInfo = qg.getSystemInfoSync()
    VivoAd.log('init', JSON.stringify(this.systemInfo))

    this.initAds()
  }
  private initAds(): void {
    if (this.systemInfo.platformVersionCode >= 1031) {
		  this._banner = new BannerAd('', '')
		  this._insert = new InsertAd('', '')
    }

    if (this.systemInfo.platformVersionCode >= 1041)
		  this._reward = new RewardAd('', '')
    if (this.systemInfo.platformVersionCode >= 1091)
      this._custom = new CustomAd('', '')
    if (this.systemInfo.platformVersionCode >= 1092) {
		  this._box_banner = new BoxBannerAd('', '')
		  this._box_portal = new BoxPortalAd('', '')
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
      if (param.type === '0') boxAd = this._box_banner
      if (param.type === '1') boxAd = this._box_portal
    }
    return this.showAd('盒子广告', boxAd, param)
  }
  showBanner(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('banner广告',this._banner, param)
  }
  hideBanner(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('banner隐藏',this._banner, param)
  }
  showInsert(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('插屏广告', this._insert, param)
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
}
