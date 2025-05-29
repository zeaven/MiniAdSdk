import { AdHandler, AdInitConfig, AdInterface, AdInvokeResult, AdParam, AdType, IAdConfig } from "../../Types";
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
  config: AdInitConfig
  private _curNativeResult: AdInvokeResult

  constructor (config: AdInitConfig) {
    this.config = config
  }

  init(initConfig: AdInitConfig): void {
    this.systemInfo = my.getSystemInfoSync()
    log('init', JSON.stringify(this.systemInfo))
    this.config = initConfig
    this.initAds()
  }
  private initAds(): void {
    const pixelRatio = this.systemInfo.pixelRatio;
    my.setEnableDebug({enableDebug: CC_DEBUG})
    this._inters = new AliIntersAd(...this.config.adConfig.INTERS_ID)
    this._reward = new AliRewardAd(...this.config.adConfig.REWARD_ID)
    this._banner = new AliBannerAd(...this.config.adConfig.BANNER_ID)
  }
  private showAd(
    adName: AdType,
    ad?: AdHandler,
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
    return Promise.reject("暂未实现")
  }
  showCustom(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd(AdType.Custom, null, param)
  }
  hideCustom(param?: AdParam): Promise<void> {
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

