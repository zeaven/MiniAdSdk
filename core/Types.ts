const {Enum} = cc
const { ccclass, property } = cc._decorator

type Runnable = () => void
type Callback = (...args: any[]) => void

interface PrivacyContext {
  agreePrivacy(): void
}
/**
 * 广告初始化配置
 */
interface AdInitConfig{
  // 是否开启调试模式，默认关闭，开启后会输出日志到控制台，方便调试，发布时请关闭，否则会影响性能，影响游戏体验
  debug?: boolean
  sdkVersion?: string
  // 广告配置，无需手动配置，会自动加载
  adConfig?: IAdConfig
  // 隐私协议，实现此方法即开启隐私弹窗
  privacy?: (ctx: PrivacyContext) => void
  // 是否开启登录，默认开启
  enableLogin?: boolean
  // 是否开启远程配置，默认开启
  enableRemoteConfig?: boolean
  [extra: string]: any
}

/**
 * 广告配置
 */
interface IAdConfig {
  APP_ID?: string
  PACKAGE_NAME?: string
  APP_VERSION?: string
  APP_NAME?: string
  APP_CHANNEL?: string
  BANNER_ID: string[]
  INTERS_ID: string[]
  REWARD_ID: string[]
  CUSTOM_ID: string[]
  NATIVE_ID: string[]
  BOX_ID: string[]  // 
  PORTAL_ID: string[]
  [extra: string]: any
}

/**
 * 广告参数
 */
type AdParam = {
  /**
   * /类型参数，用于区分同一种广告的不区类型，或者同一广告在不同场景展示的样式
   */
  type?: number | null 
  /**
   * 可以是广告样式数据或奖励数据等
   */
  data?: any | null
  /**
   * 原生广告是否显示下载按钮
   */
  showDownloadButton?: boolean
  /**
   * 
   */
  disableCloseBtn?: boolean
  [extra: string]: any
}
/**
 * 广告会话，每次调用广告回调里返回的实例，用于手动关闭或销毁广告
 */
interface AdSession {
  close(): void
  destroy(): void
}
/**
 * 广告处理接口，如banner、插屏、奖励视频等
 */
interface AdHandler extends AdSession {
  readonly name: string
  show(param?: AdParam): Promise<AdInvokeResult>
  close(): void
  destroy(): void
}

/**
 * 广告回调类型
 */
interface AdInvokeResult {
  /**
   * 广告实例
   */
  session?: AdSession
  /**
   * 激励回调
   */
  rewardPromise?: Promise<void> | null
  /**
   * 关闭代理回调
   */
  onClose?: Runnable,
  [extra: string]: any
}

/******** 登录 **********/

enum LoginCode {
  SUCCESS = 0,        // 登录成功
  CANCEL_LOGIN = 1,   // 取消登录
  CANCEL_REALNAME = 2, // 取消实名
  FAILED = 3,         // 登录失败
}

interface LoginResult {
  code: LoginCode
  data: ApiLoginData
}

/**
 * 登录接口
 */
interface ILoginable {
  /**
   * 登录接口
   * @returns 是否登录成功
   */
  login(): Promise<LoginResult>
}
/********* 登录 end **********/

/**
 * 广告SDK接口，如vivo、oppo广告接口
 */
interface AdInterface {
  init(config?: AdInitConfig): any
  
  showBox(param?: AdParam): Promise<AdInvokeResult>
  showBanner(param?: AdParam): Promise<AdInvokeResult>
  hideBanner(param?: AdParam): Promise<AdInvokeResult>
  showInters(param?: AdParam): Promise<AdInvokeResult>
  showReward(param?: AdParam): Promise<AdInvokeResult>
  showNative(param?: AdParam): Promise<AdInvokeResult>
  showCustom(param?: AdParam): Promise<AdInvokeResult>
  hideCustom(param?: AdParam): Promise<AdInvokeResult>
  showToast(msg: string, duration: number): void
}
interface IAdSdk extends AdInterface {
  adapter: AdInterface | undefined
  platform: string
  config: Readonly<AdInitConfig>
  debug: boolean
  addInterceptor(platform: string, interceptor: AdInterceptor): void
  on(adEvent: AdNodeEvent | AdType | AdEventType, callback: EventCallback, target?: any): Runnable
  setWhitePackage(whitePackage: boolean): void
}
/**
 * 广告类型
 */
enum AdType {
  None,
  Banner ,
  Interstitial ,
  Reward ,
  Custom,
  Native,
  Combo
}
/**
 * 广告节点事件
 */
enum AdNodeEvent {
  BannerShow = 'banner:show',
  BannerHide = 'banner:hide',
  InterstitialShow = 'interstitial:show',
  Interstitialhide = 'interstitial:hide',
  RewardShow = 'reward:show',
  RewardHide = 'reward:hide',
  CustomShow = 'custom:show',
  CustomHide = 'custom:hide',
  NativeShow = 'Native:show',
  NativeHide = 'Native:hide',
  ComboShow = 'combo:show',
  ComboHide = 'combo:hide',
}

Enum(AdType)

/**
 * 广告事件类型
 */
enum AdEventType {
  SdkInited = 'Sdk:inited',
  AdLoaded = 'ad:loaded',
  AdClosed = 'ad:closed',
  AdError = 'ad:error',
  AdReward = 'ad:reward',
  AdShowed = 'ad:showed',
  AdHided = 'ad:hided',
  AdClicked = 'ad:clicked',
  LoginSuccess = 'login:success',
  LoginCancelLogin = 'login:cancel-login',
  LoginCancelRealname = 'login:cancel-realname',
  LoginFailed = 'login:failed',
  PrivacyAgreed = 'privacy:agreed',
}

@ccclass('AdEventHandler')
class AdEventHandler {
  @property({type:AdType, tooltip: '广告类型'})
  type: AdType = AdType.None
  @property({tooltip: '广告数据, 如: 1、2等,在展示广告时判断展示样式'})
  data: string = ''
}

/**
 * 广告事件回调函数
 */
type EventCallback = (...args: any[]) => void
type AdInvokeNext = (param:AdParam) => Promise<AdInvokeResult>
type AdInitNext = (config: AdInitConfig) => Promise<void>
/**
 * 拦截器
 */
interface AdInterceptor {
  attach(sdk: IAdSdk): void
  init?: (next: AdInitNext , param?: AdInitConfig) => any
  showBox?: (next: AdInvokeNext, param?: AdParam) => Promise<AdInvokeResult> | void
  showBanner?: (next: AdInvokeNext, param?: AdParam) => Promise<AdInvokeResult> | void
  hideBanner?: (next: AdInvokeNext, param?: AdParam) => Promise<AdInvokeResult> | void
  showInters?: (next: AdInvokeNext, param?: AdParam) => Promise<AdInvokeResult> | void
  showReward?: (next: AdInvokeNext, param?: AdParam) => Promise<AdInvokeResult> | void
  showNative?: (next: AdInvokeNext, param?: AdParam) => Promise<AdInvokeResult> | void
  showCustom?: (next: AdInvokeNext, param?: AdParam) => Promise<AdInvokeResult> | void
  hideCustom?: (next: AdInvokeNext, param?: AdParam) => Promise<AdInvokeResult> | void
}

interface AdHttpContext {
  url: string
  readonly method: string
  data?: any
  headers?: Record<string, any>
  cancel?: () => void
}

/**
 * 登录数据
 */
interface ApiLoginData {
  code?: string
  scene: string
  clickid?: string
  oaid?: string
  playerId?: string
  localId?: string
  deviceId?: string
  appId: string
  appVersion: string
  packageName: string
  brand: string
  ot: string
  sdkVersion: string
  platform: string
}
interface ApiReportData {
  /**
   * 服务端每次初始化生成的唯一标识，类似 session id
  */ 
  ssid?: string
  /**
   * 服务端根据oaid、localId、playerId生成的唯一标识，用于区分不同用户
  */
  cid?: string
  adID: string
  adType: string
  msg: string
  [extra: string]: any
}

export {
  AdParam, AdInvokeResult, AdInterface, AdHandler, Callback, AdType, AdNodeEvent, AdSession, Runnable,
  AdEventHandler, AdInterceptor,IAdConfig,AdInitNext,EventCallback, PrivacyContext,
  AdEventType, AdInitConfig,AdInvokeNext, IAdSdk, ILoginable,LoginResult, LoginCode,
  ApiLoginData, AdHttpContext, ApiReportData
}
