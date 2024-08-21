import { AdHandler, AdInterface, AdInvokeResult, AdParam, IAdConfig } from "../Types";
import { LogHandle, get_log } from "../utils/Log";
import AliBaseAd from "./AliBaseAd";
import AliIntersAd from "./AliIntersAd";
import AliRewardAd from "./AliRewardAd";

export default class BoxAd implements AdInterface {
  public static log: LogHandle = get_log('Alipay')
  systemInfo: any;
  private _inters: AliBaseAd;
  private _reward: AliBaseAd;
  config: IAdConfig;

  constructor (config: IAdConfig) {
    this.config = config
  }

  init(): void {
    this.systemInfo = globalThis.gamebox.getSystemInfoSync()
   this.initAds()
  }
  private initAds(): void {
    const pixelRatio = this.systemInfo.pixelRatio;
    my.setEnableDebug({enableDebug: CC_DEBUG})
    this._inters = new AliIntersAd(...this.config.INTERS_ID)
    this._reward = new AliRewardAd(...this.config.REWARD_ID)
  }
  private showAd(
    adName: string,
    ad?: AdHandler,
    param?: AdParam
  ): Promise<AdInvokeResult> {
    if (ad) {
      BoxAd.log(`广告${adName}被调用`)
      return ad.show(param)
    } else {
      BoxAd.log(`广告${adName}未初始化`)
      return Promise.reject(adName + '无效')
    }
  }
  showBox(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('banner广告',null, param)
  }
  showBanner(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('banner广告',null, param)
  }
  hideBanner(param?: AdParam): Promise<AdInvokeResult> {
    // this._banner && this._banner.close()
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
