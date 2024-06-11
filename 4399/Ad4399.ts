import { AdInterface, AdInvokeResult, AdParam } from "../Types";
import { LogHandle, get_log } from "../utils/Log";
import RewardAd4399 from "./RewardAd4399";

export default class Ad4399 implements AdInterface {
  public static log: LogHandle = get_log('4399Ad')
  private _reward: RewardAd4399;
  init(): void {
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
  showInsert(param?: AdParam): Promise<AdInvokeResult> {
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
