/**
 * 广告SDK
 */

const { ccclass } = cc._decorator
import AdEventBus from "./utils/AdEventBus";
import { get_log } from "./utils/Log";
import { Platform, getPlatform } from "./utils/Platform";
import { AdCallback, AdEvent, AdEventHandler, AdInterceptor, AdInterface, AdInvokeResult, AdInvokeType, AdParam, AdType } from "./Types";
import { TTInterceptor } from './utils/Interceptor'
import TTAd from "./tt/TTAd";
import VivoAd from "./vivo/VivoAd";
import ConfigBinder from "./utils/ConfigBinder";
import JsAd from "./JsAd";



@ccclass
export default class AdSdk implements AdInterface {
  private static _instance: AdSdk
  public static log = get_log('AdSdk')
  
  private _platform: string = ''
  private _adapter?: AdInterface
  
  private _interceptors: { [key:string]: AdInterceptor[] } = {}
  private _whitePackage: boolean;
  private _inited = false

  static get instance(): AdSdk {
    if (!this._instance) {
      const sdkProxy = {
        get: function(target: AdSdk, prop: string) {
          if ((prop.startsWith('show') || prop.startsWith('hide')) && typeof target[prop] === 'function') {
            return function (...args:any[]): any {
              return target.invoke(prop, ...args)
            }
          } else {
            return target[prop]
          }
        }
      }
      this._instance = new Proxy(new AdSdk(), sdkProxy)
      this._instance.init()
    }
    return this._instance
  }

  init(): void {
    if (this._inited) return
    this._inited = true
    this._platform = getPlatform()
    AdSdk.log('初始化, 平台:' + this._platform)
    this._adapter = this.getAdapter(this._platform)
    if (this._adapter) this._adapter.init()
    ConfigBinder.instance.init()
  }

  private getAdapter(name: string): AdInterface | undefined {
    let adapter: AdInterface | undefined
    switch (name) {
      case Platform.VIVO:
        adapter = new VivoAd()
        break
      case Platform.TT:
        adapter = new TTAd()
        this.addInterceptor(name, new TTInterceptor())
      default:
        adapter = new JsAd()
        break
    }

    return adapter
  }

  private invoke(method: string, ...args: any[]): Promise<AdInvokeResult> {
    if (this._whitePackage) {
      return Promise.resolve( {session: null, rewardPromise: Promise.resolve()})
    }
    if (this._adapter && this._adapter[method]) {
      AdSdk.log(`${method}被调用`, JSON.stringify(args))
      const interceptors = this._interceptors[this._platform]
      if (interceptors) {
        return this.callInterceptor(method, args, interceptors)
          .then(result => {
            if (Array.isArray(result)) {
              return this._adapter[method](...result)
            }
            return result
          })
          .catch(err => {
            AdSdk.log('请求失败: ' + err)
            return Promise.reject(err)
          })
      }
      
      return this._adapter[method](...args)
    } else {
      return Promise.reject('广告无效')
    }
  }
  private callInterceptor(method: string, args: any[], interceptors: AdInterceptor[]): Promise<any> {
    let result = Promise.resolve(args)
    for (const interceptor of interceptors) {
      if (typeof interceptor[method] !== 'function') {
        continue
      }
      result = result.then(lastParam => {
        if (Array.isArray(lastParam)) {
          return new Promise(resolve => {
            interceptor[method](res => resolve(res), ...lastParam)
          })
        } else if (!lastParam) {
          return Promise.reject('取消请求')
        }
        
        return lastParam
      })
    }
    
    return result
  }
  /**
   * 添加拦截器
   * 可以对广告调用开始和调用结束进行处理
   * 用于对特定平台广告展示的限制处理，如抖音插屏
   * @param platform 平台
   * @param interceptor 拦截器，编写对应方法如 showBannerBegin或showBannerEnd，当showBanner方法被调用就会执行拦截器方法
   */
  public addInterceptor(platform: string, interceptor: AdInterceptor) {
    if (!interceptor) return
    if (!(platform in this._interceptors)) {
      this._interceptors[platform] = []
    }
    this._interceptors[platform].push(interceptor)
    interceptor.init()
  }

  /**
   * 监听广告回调
   * @param adEvent 广告事件
   * @param callback 监听事件回调
   * @param target 绑定对象
   */
  public on(adEvent: AdEvent | AdType, callback: AdCallback, target: any) {
    let event: string
    if (typeof adEvent === 'number') {
      event = AdType[adEvent]
    } else {
      event = adEvent
    }
    AdEventBus.instance.on(event, (node: cc.Node, data: AdEventHandler[]|string) => {
      callback({event: event, node: node}, data)
    }, target)
  }

  public setWhitePackage(whitePackage: boolean) {
    this._whitePackage = whitePackage
  }

  showBox(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  showBanner(param?: AdParam | undefined): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  hideBanner(param?: AdParam | undefined): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  showInsert(param?: AdParam | undefined): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  showReward(param?: AdParam | undefined): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  showNative(param?: AdParam | undefined): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  showCustom(param?: AdParam | undefined): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  hideCustom(param?: AdParam | undefined): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  showToast(msg: string, duration: number): void {
    throw new Error('Method not implemented.')
  }
}
