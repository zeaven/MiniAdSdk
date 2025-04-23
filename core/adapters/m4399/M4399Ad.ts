import { AdInitConfig, AdInterface, AdInvokeResult, AdParam, IAdConfig } from "../../Types";
import log from "./M4399Log"
import RewardAd4399 from "./RewardAd4399";

export default class M4399Ad implements AdInterface {
  
  private _reward: RewardAd4399;
  config: IAdConfig;

  constructor (config: IAdConfig) {
    this.config = config
  }

  init(initConfig: AdInitConfig): void {
    this.config = initConfig.adConfig?? this.config
    log('init', JSON.stringify(this.config))
    this._reward = new RewardAd4399();
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
    throw new Error("Method not implemented.");
  }
  showReward(param?: AdParam): Promise<AdInvokeResult> {
    return this._reward.show(param);
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
    throw new Error("Method not implemented.");
  }

}
