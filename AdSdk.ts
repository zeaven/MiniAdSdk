/**
 * 广告SDK
 */

const { ccclass } = cc._decorator
import AdEventBus from "./utils/AdEventBus";
import { get_log } from "./utils/Log";
import { Platform, getPlatform } from "./utils/AdPlatform";
import { AdCallback, AdEvent, AdEventHandler, AdInterceptor, AdInterface, AdInvokeResult, AdParam, AdType } from "./Types";
import { DelayInterceptor, TTInterceptor } from './utils/Interceptor'
import TTAd from "./tt/TTAd";
import VivoAd from "./vivo/VivoAd";
import ConfigBinder from "./utils/ConfigBinder";
import JsAd from "./JsAd";
import KsAd from "./ks/KsAd";
import Ad4399 from "./4399/Ad4399";
import BoxAd from "./box4399/BoxAd";
import OppoAd from "./oppo/OppoAd";
import { Ad4399Config, Box4399Config, KsConfig, OppoConfig, TTConfig, VivoConfig } from "./AdConfig";



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
    this.addInterceptor(name, new DelayInterceptor())

    switch (name) {
      case Platform.VIVO:
        adapter = new VivoAd(new VivoConfig())
        break
      case Platform.TT:
        adapter = new TTAd(new TTConfig())
        this.addInterceptor(name, new TTInterceptor())
        break
      case Platform.KS:
        adapter = new KsAd(new KsConfig())
        this.addInterceptor(name, new TTInterceptor())
        break
      case Platform.M4399:
        adapter = new Ad4399(new Ad4399Config())
        break
      case Platform.BOX4399:
        adapter = new BoxAd(new Box4399Config())
        break;
      case Platform.OPPO:
        adapter = new OppoAd(new OppoConfig())
        break;
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
        const next = (...params: any[]) => this._adapter[method](...params)
        // 拦截器调用链
        let rr= this.callInterceptor(method, args, interceptors, next)
        if (rr instanceof Promise) {
          rr = rr.catch(err => {
            AdSdk.log(`${method}请求失败: ${err}`)
            return Promise.reject(err)
          })
        }
        return rr
      }
      
      return this._adapter[method](...args)
    } else {
      return Promise.reject('广告无效')
    }
  }
  private callInterceptor(method: string, args: any[], interceptors: AdInterceptor[], next: any): Promise<any> {
    const middlewares = []
    const runner = (...params: any[]) => {
      const invokeMethod = middlewares.shift()
      if (invokeMethod) {
        const ret = invokeMethod(runner, ...params)
        if (ret instanceof Promise) {
          return ret
        } else {
          return Promise.reject('拦截取消')
        }
      } else {
        return next(...params)
      }
    }
    for (const interceptor of interceptors) {
      if (typeof interceptor[method] !== 'function') {
        continue
      }
      middlewares.push(interceptor[method].bind(interceptor))
    }

    return runner(args)
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
    if (this._interceptors[platform].includes(interceptor)) {
      return
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

  public setPlatform(platform: string) {
    this._platform = platform
    this._adapter = this.getAdapter(this._platform)
    this._adapter && this._adapter.init()
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
  showInters(param?: AdParam | undefined): Promise<AdInvokeResult> {
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
