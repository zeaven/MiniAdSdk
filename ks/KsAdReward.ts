import { AdParam, AdInvokeResult } from "../Types";
import KsAd from "./KsAd";
import KsAdBase from "./KsAdBase";

export default class KsAdReward extends KsAdBase {
  protected name: string = '激励视频广告'
  rewardReject: any;
  rewardPromise: Promise<void>;
  rewardResolve: (...arg: any[]) => void;
  protected createAd(_id: string): any {
    if (!this.ad) {
      return globalThis.ks.createRewardedVideoAd({
        adUnitId: _id,
      })
    }
    return this.ad
  }
 
  async show(param: AdParam): Promise<AdInvokeResult> {
    const res = await super.show(param);
    if (this.rewardReject) this.rewardReject();
    this.rewardPromise = new Promise((rewardResolve, rewardReject) => {
      this.rewardResolve = (...arg_1) => rewardResolve(...arg_1);
      this.rewardReject = (err) => rewardReject(err);
    });
    res.rewardPromise = this.rewardPromise;
    return res;
  }

  onClose(res: any): void {
    super.onClose(res)

    if ((res && res.isEnded) || res === undefined) {
      if (this.rewardResolve) {
        KsAd.log(this.name, '派发奖励')
        this.rewardResolve()
      }
    } else {
      if (this.rewardReject) {
        KsAd.log(this.name, '奖励无效')
        this.rewardReject()
      }
    }
    this.rewardPromise = undefined
    this.rewardResolve = undefined
    this.rewardReject = undefined
  }
}
