/**
 * 广告SDK
 */

const { ccclass } = cc._decorator
import AdEventBus from "./utils/AdEventBus";
import { get_log } from "./utils/Log";
import { Platform, platform } from "./utils/AdPlatform";
import { AdCallback, AdEvent, AdEventHandler, AdInterceptor, AdInterface, AdInvokeResult, AdParam, AdType, IAdConfig } from "./Types";
import { DelayInterceptor, TTInterceptor } from './utils/Interceptor'
import ConfigBinder from "./utils/ConfigBinder";
import AdConfig from "./AdConfig";

// 配置加载器
const adapters: Record<string, () => Promise<any>> = {
  [Platform.WEB]: () => import('./adapters/web'),
  [Platform.ALIPAY]: () => import('./adapters/alipay'),
  [Platform.BOX4399]: () => import('./adapters/box4399'),
  [Platform.HUAWEI]: () => import('./adapters/huawei'),
  [Platform.KS]: () => import('./adapters/ks'),
  [Platform.M4399]: () => import('./adapters/m4399'),
  [Platform.OPPO]: () => import('./adapters/oppo'),
  [Platform.TT]: () => import('./adapters/tt'),
  [Platform.VIVO]: () => import('./adapters/vivo'),
}

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
    this._platform = platform
    AdSdk.log('初始化, 平台:' + this._platform)
    this.getAdapter(this._platform)
    ConfigBinder.instance.init()
  }

  private async getAdapter(name: string): Promise<void>  {
    this.addInterceptor(name, new DelayInterceptor())

    try {
      
      switch (name) {
        case Platform.TT:
          this.addInterceptor(name, new TTInterceptor())
          break
        case Platform.KS:
          this.addInterceptor(name, new TTInterceptor())
          break
        default:
          break
      }
      const module = await adapters[name]()
      const config = this.getConfig(name)
      this._adapter = new module.default(config)
      this._adapter && this._adapter.init()
      AdSdk.log(`适配器[${name}]初始化成功`)
    } catch (e) {
      AdSdk.log(`获取适配器失败: ${e}`)
    }
  }

  private getConfig(name: string): IAdConfig | undefined {
    name = name.toLowerCase() + 'config'
    // 遍历 AdConfig 类的静态属性
    for (const prop in AdConfig) {
      if (AdConfig.hasOwnProperty(prop) && prop.toLowerCase() === name) {
        return new AdConfig[prop]()
      }
    }
  }

  private invoke(method: string, ...args: any[]): Promise<AdInvokeResult> {
    if (this._whitePackage) {
      const res: AdInvokeResult = {rewardPromise: Promise.resolve()}
      return Promise.resolve( res )
    }
    if (this._adapter && this._adapter[method]) {
      AdSdk.log(`${method}被调用`, JSON.stringify(args))
      const interceptors = this._interceptors[this._platform]
      if (interceptors) {
        const next = (...params: any[]) => this._adapter && this._adapter[method](...params)
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
  private async callInterceptor(method: string, args: any[], interceptors: AdInterceptor[], next: any): Promise<any> {
    const middlewares: Array<(...params: any[]) => Promise<any>> = [];

    // 将中间件函数从拦截器中提取并绑定上下文
    for (const interceptor of interceptors) {
      if (typeof interceptor[method] === 'function') {
        middlewares.push(interceptor[method].bind(interceptor));
      }
    }
    if (middlewares.length === 0) {
      return await next(...args)
    }

    // 中间件链执行函数
    const runner = async (...params: any[]): Promise<any> => {
      const invokeMethod = middlewares.shift()
      if (invokeMethod) {
        const result = invokeMethod(runner, ...params)
        return result instanceof Promise ? result : Promise.reject('拦截取消')
      } else {
        return next(...params)
      }
    };

    // 启动中间件链
    return await runner(...args);
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
    this.getAdapter(this._platform)
  }

  showBox(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  showBanner(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  hideBanner(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  showInters(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  showReward(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  showNative(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  showCustom(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  hideCustom(param?: AdParam): Promise<AdInvokeResult> {
    throw new Error('Method not implemented.')
  }
  showToast(msg: string, duration: number): void {
    throw new Error('Method not implemented.')
  }
}
