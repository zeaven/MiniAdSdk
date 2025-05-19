/**
 * 广告SDK
 */

const { ccclass } = cc._decorator
import AdEventBus from "./utils/AdEventBus";
import { get_log, set_debug_enable } from "./utils/Log";
import { Platform, curPlatform } from "./utils/AdPlatform";
import { AdNodeEvent, AdEventType, AdInitConfig, AdInterceptor, AdInterface, AdInvokeResult, AdParam, AdType, IAdConfig, IAdSdk, EventCallback, Runnable } from "./Types";
import ConfigBinder from "./utils/ConfigBinder";
import AdConfig from "./AdConfig";
import { DelayInterceptor, TTInterceptor, RemoteConfigInterceptor, LoginInterceptor, AdStrategyInterceptor } from "./interceptors/index";

// 配置加载器
const adapters: Record<string, () => Promise<any>> = {
  [Platform.WEB]: () => import('./adapters/web/WebAd'),
  [Platform.ALIPAY]: () => import('./adapters/alipay/AlipayAd'),
  [Platform.BOX4399]: () => import('./adapters/box4399/Box4399Ad'),
  [Platform.HUAWEI]: () => import('./adapters/huawei/HuaweiAd'),
  [Platform.KS]: () => import('./adapters/ks/KsAd'),
  [Platform.M4399]: () => import('./adapters/m4399/M4399Ad'),
  [Platform.OPPO]: () => import('./adapters/oppo/OppoAd'),
  [Platform.TT]: () => import('./adapters/tt/TtAd'),
  [Platform.VIVO]: () => import('./adapters/vivo/VivoAd'),
}

@ccclass
export default class AdSdk implements IAdSdk {
  private static _instance: AdSdk
  public static log = get_log('AdSdk')
  
  private _SDK_VERSION = '1.0.0'
  private _platform: string = ''
  private _adapter?: AdInterface
  
  private _interceptors: { [key:string]: AdInterceptor[] } = {}
  private _whitePackage: boolean = false // 是否是白包
  private _inited = false
  private _config: AdInitConfig = {};
  private _interceptorPlatforms: string[] = [];
  

  get adapter(): AdInterface | undefined {
    return this._adapter
  }
  get platform(): string {
    return this._platform
  }
  get config(): Readonly<AdInitConfig> {
    return this._config
  }
  /**
   * 是否开启调试模式，默认关闭，开启后会输出日志到控制台，方便调试，发布时请关闭，否则会影响性能，影响游戏体验
   */
  get debug(): boolean {
    return this._config.debug
  }

  static get instance(): IAdSdk {
    if (!AdSdk._instance) {
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
      AdSdk._instance = new Proxy(new AdSdk(), sdkProxy)
    }
    return AdSdk._instance
  }

  private configInterceptors(platform: string) {
    // 保证每个平台只添加一次拦截器
    if (this._interceptorPlatforms.includes(platform)) {
      return
    }
    this._interceptorPlatforms.push(platform)
    this.addInterceptor(platform, new LoginInterceptor())
    this.addInterceptor(platform, new RemoteConfigInterceptor())
    this.addInterceptor(platform, new AdStrategyInterceptor())
    this.addInterceptor(platform, new DelayInterceptor())
      
    switch (platform) {
      case Platform.TT:
        this.addInterceptor(platform, new TTInterceptor())
        break
      case Platform.KS:
        this.addInterceptor(platform, new TTInterceptor())
        break
      default:
        break
    }
  }

  /**
   * @example
   * AdSdk.instance.init({debug: true,})
   * 需要隐私登录的情况下，先监听隐私弹窗事件，再初始化
   * AdSdk.instance.init({
   *    debug: true,
   *    privacy: (ctx) => {
    *     // 显示隐私弹窗
   *      showPrivacyDlg()
   *      // 如果用户同意隐私，调用 agreePrivacy，会通知Sdk继续初始化
   *      ctx.agreePrivacy()
   *      // 隐藏隐私弹窗
   *      hidePrivacyDlg()
   *    }
   * })
   * @param config 
   * @returns 
   */
  async init(config?: AdInitConfig): Promise<void> {
    if (this._inited) return
    this._inited = true
    this._config = config || {}
    this._config.debug = config?.debug ?? CC_DEBUG ?? false
    this._config.sdkVersion = this._SDK_VERSION
    this._config.enableRemoteConfig = config?.enableRemoteConfig ?? true
    //是否开启调试模式，默认关闭，开启后会输出日志到控制台，方便调试，发布时请关闭，否则会影响性能，影响游戏体验
    set_debug_enable(this._config.debug)
    AdSdk.log('初始化, 平台', curPlatform)
    return this.setPlatform(curPlatform).then(() => {
      ConfigBinder.instance.init()
      AdEventBus.instance.emit(AdEventType.SdkInited)
    }).catch(e => {
      this._inited = false
      AdSdk.log('初始化失败', e)
      return Promise.reject(e)
    })
  }

  private setPlatform(platform: string, config?: AdInitConfig): Promise<void> {
    this._platform = platform
    this._config = config ?? this._config ?? {}
    this.configInterceptors(this._platform)
    return this.loadAdapter(this._platform)
  }

  private async loadAdapter(name: string): Promise<void>  {
    const module = await adapters[name]()
    const config = this.getConfig(name)
    this._config.adConfig = config
    const adapter = new module.default(this._config)
    if (adapter) {
      AdSdk.log(`加载适配器 [${name}]`, config)
      this._adapter = adapter
      await this.invoke('init', this._config) ?? Promise.resolve()
      AdSdk.log(`加载适配器 [${this._platform}] 完成`)
      return Promise.resolve()
    }
    return Promise.reject('适配器加载失败')
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
    if (this._adapter && this._adapter[method]) {
      AdSdk.log(`${method}被调用`, args)
      const interceptors = this._interceptors[this._platform]
      if (interceptors) {
        const next = (...params: any[]): Promise<AdInvokeResult> => {
          if (this._whitePackage) {
            const res: AdInvokeResult = {rewardPromise: Promise.resolve()}
            return Promise.resolve( res )
          }
          AdSdk.log(`${this._adapter.constructor.name}.${method}方法被调用`)
          return this._adapter[method](...params)
        }
        // 拦截器调用链
        let rr= this.callInterceptor(method, args, interceptors, next)
        if (rr instanceof Promise) {
          rr = rr.catch(err => {
            AdSdk.log(`${method}请求失败`, err)
            return Promise.reject(err)
          })
        }
        return rr
      } else if (this._whitePackage) {
        const res: AdInvokeResult = {rewardPromise: Promise.resolve()}
        return Promise.resolve( res )
      }
      AdSdk.log(`${this._adapter.constructor.name}.${method}方法被调用`)
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
        AdSdk.log(`触发拦截器: ${interceptor.constructor.name}`)
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
    interceptor.attach(this)
    AdSdk.log(`添加拦截器: ${interceptor.constructor.name}`)
  }

  /**
   * 监听广告回调
   * @param adEvent 广告事件
   * @param callback 监听事件回调
   * @param target 绑定对象
   */
  public on(adEvent: AdNodeEvent | AdType | AdEventType, callback: EventCallback, target?: any): Runnable {
    let event: string
    if (typeof adEvent === 'number') {
      event = AdType[adEvent]
    } else {
      event = adEvent
    }
    return AdEventBus.instance.on(event, callback, target)
  }

  public setWhitePackage(whitePackage: boolean) {
    this._whitePackage = whitePackage
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
globalThis.AdSdk = AdSdk