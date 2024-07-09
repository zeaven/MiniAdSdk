/**
 * VIVO广告
 */

import { AdHandler, AdInterface, AdInvokeResult, AdParam, AdSession, IAdConfig } from "../Types"
import { get_log, LogHandle } from "../utils/Log";
import TTBannerAd from "./TTBannerAd";
import TTRewardAd from "./TTRewardAd";
import TTIntersAd from "./TTIntersAd";


export default class TTAd implements AdInterface {
  public static log: LogHandle = get_log('TTAd')
  private systemInfo!: any
  private _banner?: AdHandler
  private _inters?: AdHandler
  private _reward?: AdHandler
  config: IAdConfig;

  constructor(config: IAdConfig) {
    this.config = config
  }
  
  init(): void {
    this.systemInfo = globalThis.tt.getSystemInfoSync()
    TTAd.log('init', JSON.stringify(this.systemInfo))

    this.initAds()
  }
  private initAds(): void {
		  this._banner = new TTBannerAd(...this.config.BANNER_ID)
		  this._inters = new TTIntersAd(...this.config.INTERS_ID)

		  this._reward = new TTRewardAd(...this.config.REWARD_ID)
  }
  private showAd(
    adName: string,
    ad?: AdHandler,
    param?: AdParam
  ): Promise<AdInvokeResult> {
    if (ad) {
      TTAd.log(`广告${adName}被调用`)
      return ad.show(param)
    } else {
      TTAd.log(`广告${adName}未初始化`)
      return Promise.reject(adName + '无效')
    }
  }
  showBox(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('盒子广告',undefined, param)
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
    return this.showAd( '原生自渲染广告', undefined, param)
  }
  showCustom(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd( '原生模板广告', undefined, param)
  }
  hideCustom(param?: AdParam): Promise<AdInvokeResult> {
    return Promise.reject(false)
  }
  showToast(msg: string, duration: number): void {
      globalThis.tt.showToast({title: msg, duration: duration ?? 1500})
  }
}
