/**
 * VIVO广告
 */

import { AdHandler, AdInterface, AdInvokeResult, AdParam, AdSession } from "../Types"
import { get_log, LogHandle } from "../Log";
import TTBannerAd from "./TTBannerAd";
import TTRewardAd from "./TTRewardAd";
import TTInsertAd from "./TTInsertAd";


export default class TTAd implements AdInterface {
  public static log: LogHandle = get_log('TTAd')
  private systemInfo!: any
  private _banner?: AdHandler
  private _insert?: AdHandler
  private _reward?: AdHandler
  bannerSession: AdSession;
  
  init(): void {
    this.systemInfo = tt.getSystemInfoSync()
    TTAd.log('init', JSON.stringify(this.systemInfo))

    this.initAds()
  }
  private initAds(): void {
		  this._banner = new TTBannerAd('', '')
		  this._insert = new TTInsertAd('', '')

		  this._reward = new TTRewardAd('', '')
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
    return this.showAd('banner广告',this._banner, param).then(res => {
      if (res && res.session) {
        this.bannerSession = res.session
      }
      return res;
    })
  }
  hideBanner(param?: AdParam): Promise<AdInvokeResult> {
    if (this.bannerSession) {
      this.bannerSession.close()
      this.bannerSession = null
    }
    return Promise.reject(false)
  }
  showInsert(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('插屏广告', this._insert, param)
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
  showToast(msg: string, duration: number): void {
      tt.showToast({title: msg, duration: duration ?? 1500})
  }
}
