import { AdHandler, AdInvokeResult, AdParam } from "../Types"
import { ManualPromise } from "../utils/AdUtils";
import Ad4399 from "./Ad4399";

export default class RewardAd4399 implements AdHandler {
  show(param: AdParam): Promise<AdInvokeResult> {
    const result = new ManualPromise<AdInvokeResult>()
    const rewardPromise = new ManualPromise<void>()
    const res: AdInvokeResult = { session: this, rewardPromise: rewardPromise.promise }

    let adResult = obj => {
      Ad4399.log("代码:" + obj.code + ",消息:" + obj.message);
      if (obj.code === 10000) {
        Ad4399.log("开始播放");
      } else if (obj.code === 10001) {
        Ad4399.log("播放结束");
        rewardPromise.resolve()
        result.resolve(res)
      } else {
        Ad4399.log("广告异常");
        rewardPromise.reject("广告异常")
        result.resolve(res)
      }
    }

    this.canPlay(({canPlayAd, remain}) => {
      if (canPlayAd) {
        globalThis.h5api.playAd(adResult)
      } else {
        result.reject("播放次数已用完");
      }

    })

    return result.promise;
  }
  close(): void {
    // throw new Error("Method not implemented.")
  }
  destroy(): void {
    // throw new Error("Method not implemented.")
  }

  canPlay(callback) {
    globalThis.h5api.canPlayAd(data => {
      Ad4399.log(`是否可播放广告：${data.canPlayAd}, 剩余次数: ${data.remain}`)
      callback && callback({canPlayAd: data.canPlayAd, remain: data.remain})
    });
  }
}
