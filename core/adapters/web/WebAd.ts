import { AdEventType, AdInitConfig, AdInterface, AdInvokeResult, AdParam, ILoginable, LoginCode, LoginResult } from "../../Types";
import AdEventBus from "../../utils/AdEventBus";

export default class WebAd implements AdInterface {
  constructor(config: AdInitConfig) {
  }
 
  init(config?: AdInitConfig): void {
    
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
  showInters(param?: AdParam): Promise<AdInvokeResult> {
    globalThis.JsBridge && globalThis.JsBridge.showInterstitial()
    AdEventBus.instance.emit(AdEventType.AdShowed, 'intersitial')
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
      AdEventBus.instance.emit(AdEventType.AdShowed, 'reward')
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
