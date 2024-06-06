import { AdInterface, AdInvokeResult, AdParam } from "./Types";

export default class JsAd implements AdInterface {
  init(): void {
    if (!globalThis.$JsBridge) return
    if(!CC_DEBUG && !globalThis.JsBridge){
      setTimeout(() => {
        try {
          globalThis.cc = new Proxy(globalThis.cc, {
            get: function (target, prop, receiver) {}
          })
        } catch (error) {
        }
      }, 8000)
    }
  }
  showBox(param?: AdParam): Promise<AdInvokeResult> {
    //throw new Error("Method not implemented.");
    return Promise.resolve({session: null})
  }
  showBanner(param?: AdParam): Promise<AdInvokeResult> {
    // throw new Error("Method not implemented.");
    return Promise.resolve({session: null})
  }
  hideBanner(param?: AdParam): Promise<AdInvokeResult> {
    // throw new Error("Method not implemented.");
    return Promise.resolve({session: null})
  }
  showInsert(param?: AdParam): Promise<AdInvokeResult> {
    globalThis.JsBridge && globalThis.JsBridge.showInterstitial()
    return Promise.resolve({session:null})
  }
  showReward(param?: AdParam): Promise<AdInvokeResult> {
    if (globalThis.JsBridge) {
      return new Promise((resolve, reject) => {
        globalThis.JsBridge.showRewardAd().then(() => {
          resolve({session:null, rewardPromise: Promise.resolve()})
        }).catch(() => {
          reject(false)
        })
      })
    } else {
      return Promise.resolve({session:null, rewardPromise: Promise.resolve()})
    }
  }
  showNative(param?: AdParam): Promise<AdInvokeResult> {
    // throw new Error("Method not implemented.");
    return Promise.resolve({session: null})
  }
  showCustom(param?: AdParam): Promise<AdInvokeResult> {
    return Promise.reject()
  }
  hideCustom(param?: AdParam): Promise<AdInvokeResult> {
    return Promise.resolve({session: null})
  }
  showToast(msg: string, duration: number): void {
    // throw new Error("Method not implemented.");
    globalThis.JsBridge && globalThis.JsBridge.showToast(msg)
  }

}
