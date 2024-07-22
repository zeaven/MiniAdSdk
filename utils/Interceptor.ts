import { AdInterceptor, AdInvokeResult, AdInvokeType, AdParam, AdType } from "../Types";

/**
 * 
 * @param func 延时方法
 * @param limit 延时时间
 * @returns 
 */
function throttle(func: Function, limit: number): any {
    let inThrottle: boolean = false;

    return function(next: AdInvokeType, param: AdParam): any {
        if (!inThrottle) {
            inThrottle = true;
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(func(next, param))
                inThrottle = false
              }, limit)
            })
        }
    };
}

/**
 * retry方法
 * @param {Function} fn - 需要重试的异步函数
 * @param {number} retries - 重试次数
 * @param {number} delay - 每次重试之间的延迟（毫秒）
 * @param {timeout} timeout - 超时时间
 * @returns {Promise} - 返回一个Promise对象
 */
async function retry(fn: Function, retries = 3, delay = 100, timeout = 5000) {
  const startTime = new Date().getTime()
  let curTime = 0
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      curTime = new Date().getTime()
      if (startTime + timeout > curTime) {
        // 超时
        throw error
      }
      if (attempt < retries) {
        console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        console.error(`All ${retries + 1} attempts failed.`)
        throw error
      }
    }
  }
}

/**
 * 插屏广告频控
对于插屏广告的展示，有一定的频率控制，具体如下：

1. 小游戏启动后的前30s（秒），不能展示插屏广告。

2. 已经展示一次插屏广告后，第二次展示需要距离上一次展示60s。

3. 展示过一次激励视频广告后，后续需要展示插屏广告的情况下，需要与激励视频广告的展示间隔60s。
 */
/**
 * 抖音拦截器
 * 处理插屏限制逻辑
 */
class TTInterceptor implements AdInterceptor {
  private startTime: number
  private rule1: boolean = true
  private lastShowAt: number = 0
  public init(): void {
    this.startTime = Date.now()
  }

  showInters (next: AdInvokeType, param: AdParam): Promise<AdInvokeResult>| void {
    if (this.rule1) {
      this.rule1 = (Date.now() - this.startTime) < 30000
      if (this.rule1) return
    }
    let passTime = Date.now() - this.lastShowAt
    if (passTime < 60000) return
    
    return next(param).then(res => {
      this.lastShowAt = passTime  // 更新展示时间
      return res
    })
  }

  showReward (next: AdInvokeType, param: AdParam): Promise<AdInvokeResult>| void {
    return next(param).then(res => {
      this.lastShowAt = Date.now()  // 更新展示时间
      return res
    })
  }
}

/**
 * 激励视频延时1秒展示
 */
class DelayInterceptor implements AdInterceptor {
  init(): void {
    const _method = this.showReward.bind(this)
    this.showReward = throttle(_method, 1000)
  }
  showReward (next: AdInvokeType, param: AdParam): Promise<AdInvokeResult> | void {
    return next(param)
  }
}

/**
 * 重试广告
 */
class RetryInterceptor implements AdInterceptor {
  count: number;
  timeoutMs: number;
  adTypes: AdType[];
  /**
   * 
   * @param count 重试次数
   * @param timeoutMs 重试超时时间
   * @param {AdType} adTypes - 需要重试的广告类型
   */
  constructor (count: number, timeoutMs: number, adTypes: AdType[]) {
    this.count = count
    this.timeoutMs = timeoutMs
    this.adTypes = adTypes
  }
  init(): void {
    
  }

  show (next: AdInvokeType, param: AdParam, adType: AdType): Promise<AdInvokeResult> | void {
    if (!this.adTypes.includes(adType)) {
      return next(param)
    }
    return retry(() => next(param), this.count, 100, this.timeoutMs)
  }

  showCustom (next: AdInvokeType, param: AdParam): Promise<AdInvokeResult> | void {
    return this.show(next, param, AdType.Custom)
  }

  showInters (next: AdInvokeType, param: AdParam): Promise<AdInvokeResult> | void {
    return this.show(next, param, AdType.Interstitial)
  }
}

export { TTInterceptor, DelayInterceptor, RetryInterceptor }

