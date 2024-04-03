/**
 * 广告SDK
 */

const { ccclass } = cc._decorator
import AdEventBus from "./AdEventBus";
import { get_log, set_debug_enable } from "./Log";
import { Platform, getPlatform } from "./Platform";
import { AdCallback, AdEvent, AdInterceptor, AdInterface, AdInvokeResult, AdInvokeType, AdParam, AdType } from "./Types";
import { TTInterceptor } from './Interceptor'
import TTAd from "./tt/TTAd";
import VivoAd from "./vivo/VivoAd";



@ccclass
export default class AdSdk implements AdInterface {
  private static _instance: AdSdk
  public static log = get_log('AdSdk')
  

  private _platform: string = ''
  private _adapter?: AdInterface
  private _interceptors: { [key:string]: AdInterceptor[] } = {}

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
    set_debug_enable(CC_DEBUG)
    this._platform = getPlatform()
    AdSdk.log('初始化, 平台:' + this._platform)
    this._adapter = this.getAdapter(this._platform)
    if (this._adapter) this._adapter.init()
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
        break
    }

    return adapter
  }

  private invoke(method: string, ...args: any[]): Promise<AdInvokeResult> {
    if (this._adapter && this._adapter[method]) {
      AdSdk.log(`${method}被调用`, JSON.stringify(args))
      let interceptor = this._interceptors[this._platform]
      if (interceptor && typeof interceptor[method] === 'function') {
        let next: AdInvokeType = (...p:any[]) => this._adapter[method](...p)
        let p = interceptor[method](next, ...args)
        if (p instanceof Promise) {
          return p.catch(err => {
            AdSdk.log('请求失败：' + err)
            return Promise.reject(err)
          })
        } else {
          AdSdk.log('请求取消')
          return Promise.reject('请求取消')
        }
      }
      return this._adapter[method](...args)
    } else {
      return Promise.reject('广告无效')
    }
  }
  /**
   * 添加拦截器
   * 可以对广告调用开始和调用结束进行处理
   * 用于对特定平台广告展示的限制处理，如抖音插屏
   * @param platform 平台
   * @param interceptor 拦截器，编写对应方法如 showBannerBegin或showBannerEnd，当showBanner方法被调用就会执行拦截器方法
   */
  public addInterceptor(platform: string, interceptor: AdInterceptor) {
    if (!(platform in this._interceptors)) {
      this._interceptors[platform] = []
    }
    this._interceptors[platform].push(interceptor)
    interceptor.init();
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
    AdEventBus.instance.on(event, (node: cc.Node, data: string) => {
      callback({event: event, node: node}, data)
    }, target)
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
