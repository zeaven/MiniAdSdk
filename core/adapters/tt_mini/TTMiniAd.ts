import { AdHandler, AdInitConfig, AdInterface, AdInvokeResult, AdParam, AdType, ILoginable, LoginResult } from "../../Types";
import log from "./TTMiniLog";
import TTMiniLogin from "./TTMiniLogin";
import TTMiniRewardAd from "./TTMiniRewardAd";

export default class TTMiniAd implements AdInterface, ILoginable {
    private _reward?: AdHandler
    config: AdInitConfig;

    constructor(config: AdInitConfig) {
        this.config = config
    }
    login(): Promise<LoginResult> {
        return TTMiniLogin.login(this.config)
    }
    
    init(initConfig: AdInitConfig): void {
        this.config = initConfig
        this.initAds()
    }
    private initAds(): void {
        this._reward = new TTMiniRewardAd(...this.config.adConfig.REWARD_ID)
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
    return this.showAd(AdType.Box, undefined, param)
  }
  showBanner(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd(AdType.Banner,undefined, param)
  }
  hideBanner(param?: AdParam): Promise<void> {
    return Promise.resolve()
  }
  showInters(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd(AdType.Interstitial, undefined, param)
  }
  showReward(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd(AdType.Reward, this._reward, param)
  }
  showNative(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd(AdType.Native, undefined, param)
  }
  hideNative(param?: AdParam): Promise<void> {
    return Promise.reject(false)
  }
  showCustom(param?: AdParam): Promise<AdInvokeResult> {
    return this.showAd(AdType.Custom, undefined, param)
  }
  hideCustom(param?: AdParam): Promise<void> {
    return Promise.reject(false)
  }
    showToast(msg: string, duration: number): void {
        throw new Error("Method not implemented.");
    }
}