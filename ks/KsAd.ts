import { AdHandler, AdInterface, AdInvokeResult, AdParam, IAdConfig } from "../Types";
import { LogHandle, get_log } from "../utils/Log";
import KsAdInters from "./KsAdInters";
import KsAdReward from "./KsAdReward";


export default class KsAd implements AdInterface {
  public static log: LogHandle = get_log('KsAd')
  systemInfo: any;
  private _inters: KsAdInters;
  private _reward: KsAdReward;
  config: IAdConfig;

  /**
   *
   */
  constructor(config: IAdConfig) {
    this.config = config
  }

  init(): void {
    this.systemInfo = globalThis.ks.getSystemInfoSync()
    KsAd.log('init', JSON.stringify(this.systemInfo))

    this.initAds();
  }
  initAds() {
    this._inters = new KsAdInters(this.config.INTERS_ID)
    this._reward = new KsAdReward(this.config.REWARD_ID)
  }
  private showAd(
    adName: string,
    ad?: AdHandler,
    param?: AdParam
  ): Promise<AdInvokeResult> {
    if (ad) {
      KsAd.log(`广告${adName}被调用`)
      return ad.show(param)
    } else {
      KsAd.log(`广告${adName}未初始化`)
      return Promise.reject(adName + '无效')
    }
  }
  showBox(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error("Method not implemented.");
  }
  showBanner(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error("Method not implemented.");
  }
  hideBanner(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error("Method not implemented.");
  }
  showInters(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('插屏广告', this._inters, param)
  }
  showReward(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd('激励视频广告广告', this._reward, param)
  }
  showNative(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error("Method not implemented.");
  }
  showCustom(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error("Method not implemented.");
  }
  hideCustom(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error("Method not implemented.");
  }
  showToast(msg: string, duration: number): void {
    globalThis.ks.showToast({title: msg, duration: duration ?? 1500})
  }

}
