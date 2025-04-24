const {Enum} = cc
const { ccclass, property } = cc._decorator

type Runnable = () => void
type Callback = (...args: any[]) => void

/**
 * 广告初始化配置
 */
interface AdInitConfig{
  debug?: boolean
  adConfig?: IAdConfig
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
  type?: number | null // 类型参数，用于区分同一种广告的不区类型，或者同一广告在不同场景展示的样式
  data?: any | null  // 可以是广告样式数据或奖励数据等
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
  session?: AdSession
  rewardPromise?: Promise<void> | null
  onClose?: Runnable,
  [extra: string]: any
}

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
 * 广告事件
 */
enum AdEvent {
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

enum AdEventType {
  AdLoaded = 'ad:loaded',
  AdClosed = 'ad:closed',
  AdError = 'ad:error',
  AdReward = 'ad:reward',
  AdShowed = 'ad:showed',
  AdHided = 'ad:hided',
  AdClicked = 'ad:clicked',
}

@ccclass('AdEventHandler')
class AdEventHandler {
  @property({type:AdType, tooltip: '广告类型'})
  type: AdType = AdType.None
  @property({tooltip: '广告数据, 如: 1、2等,在展示广告时判断展示样式'})
  data: string = ''
}
/**
 * 广告事件回调上下文
 */
type AdContext = {
  event: string    // 广告事件
  node: cc.Node     // 触发广告的节点
}
/**
 * 广告事件回调函数
 */
type AdCallback = (context: AdContext, data: AdEventHandler[]|string) => void
type AdInvokeNext = (param:AdParam) => Promise<AdInvokeResult>
type AdInitNext = (config: AdInitConfig) => Promise<void>
/**
 * 拦截器
 */
interface AdInterceptor {
  attach(): void
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

export {
  AdParam, AdInvokeResult, AdInterface, AdHandler, Callback, AdType, AdEvent,AdSession, Runnable,
  AdEventHandler, AdContext, AdCallback, AdInterceptor,IAdConfig,AdInitNext,
  AdEventType, AdInitConfig,AdInvokeNext,
}
