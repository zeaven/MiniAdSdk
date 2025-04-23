import { AdHandler, AdInitConfig, AdInterface, AdInvokeResult, AdParam, IAdConfig } from "../../Types";
import AliBannerAd from "./AliBannerAd";
import AliIntersAd from "./AliIntersAd";
import AliRewardAd from "./AliRewardAd";
import log from "./AliLog"
import AdBase from "../AdBase";

export default class AlipayAd implements AdInterface {
  private systemInfo: my.SystemInfo
  private _banner: AdBase
  private _inters: AdBase
  private _reward: AdBase
  config: IAdConfig

  constructor (config: IAdConfig) {
    this.config = config
  }

  init(initConfig: AdInitConfig): void {
    this.systemInfo = my.getSystemInfoSync()
    log('init', JSON.stringify(this.systemInfo))
    this.config = initConfig.adConfig?? this.config
    this.initAds()
  }
  private initAds(): void {
    const pixelRatio = this.systemInfo.pixelRatio;
    my.setEnableDebug({enableDebug: CC_DEBUG})
    this._inters = new AliIntersAd(...this.config.INTERS_ID)
    this._reward = new AliRewardAd(...this.config.REWARD_ID)
    this._banner = new AliBannerAd(...this.config.BANNER_ID)
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
    return this.showAd('banner广告',null, param)
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
    !!msg && my.showToast({
      content: msg,
      duration: duration?? 1500
    })
  }
}

