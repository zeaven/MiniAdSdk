import { AdEventType, AdHandler, AdInvokeResult, AdParam, AdType, Runnable } from "../Types";
import AdEventBus from "../utils/AdEventBus";
import { ManualPromise } from "../utils/AdUtils";

export default abstract class AdBase implements AdHandler {
  get name(): string { return this._name }
  protected abstract log(...msg: any[]): void
  protected type: AdType = AdType.None
  protected ad: any; // 广告对象
  protected ids: string[] // 广告id列表
  private idx = 0 // 广告id索引
  private _name: string // 广告名称，如 banner广告、插屏广告等
  protected unbindAdListeners: Runnable
  protected createInterval = 1000 // 重新加载间隔 <=0，并且非立即加载，则为取消重新加载
  protected reloadCount = 0 // 重新加载次数
  protected isShowed: boolean = false // 是否展示
  protected invokeResult: AdInvokeResult // 当前展示的回调
  protected ready: boolean // 是否准备加载成功
  protected delayShowWaitTimeout = 2000 // showOnLoadPromise 等待加载完成超时时间
  // 当调用广告展示时，广告还未加载完成，则等待加载完成后再展示，否则返回加载超时错误
  private showOnLoadPromise: ManualPromise<void>
  protected autoLoad = true // 是否自动加载(包括创建广告实例和拉取广告)，默认开启，无特殊情况，一般为true
  protected properties?: any // 广告属性，构造函数最后一个参数为属性
  protected autoDestroy = true // 是否自动销毁，单例广告设置为false，如：激励视频
  protected isLoading = false // 是否正在加载
  protected adListeners: Record<string, Runnable> = {}  // 广告事件监听
  protected loadTimeout = 10000 // 加载超时时间，单位毫秒
  private loadTimeoutor: any  // 加载超时定时器
  protected reloadMaxInterval = 30000 // 重新加载最大间隔，单位毫秒

  constructor(...ids: any[]) {
    this._name = AdType[this.type]+'广告'
    this.ids = ids.filter((t) => !!t)
    if (typeof this.ids[this.ids.length-1] === 'object') {
      this.properties = this.ids.pop()
    }
    this.log(this.name + '初始化', this.ids)

    this.adListeners = this.getAdListeners()

    this.autoLoad && this.loadAd()
  }
  /**
   * 广告默认绑定事件
   * 需要增加绑定事件则重写此方法，如增加 onCompleted 事件
   */
  protected getAdListeners(): Record<string, Runnable> {
    return {
      onLoad: this.onLoad.bind(this),
      onError: this.onError.bind(this),
      onClose: this.onClose.bind(this),
      onClick: this.onClick.bind(this),
      onShow: this.onShow.bind(this),
    }
  }

  /**
   * 广告事件额外参数
   * 如：原生的额外参数：{ creativeType: 'xxx' } 
   * @returns 广告属性
   */
  protected emitOptions(): any {
    return {}
  }

  protected loadAd() {
    if (this.ids.length === 0) return
    if (this.idx >= this.ids.length) {
      this.idx = 0
    }
    if (this.ad) {
      // 销毁之前实例
      this.destroy(false)
    }
    this.ad = this.createAd(this.ids[this.idx++])
    if (!this.ad) {
      this.log(this.name + '创建失败')
    } else {
      this.log(this.name + '创建成功')
      if (!this.isLoading && !this.ready && typeof this.ad.load === 'function') {
        this.log(this.name + '开始加载')
        this.ad.load()
        this.isLoading = true
      }
      this.bindAdListeners()
    }
    if (this.isLoading) {
      this.setLoadTimeout()
    }
  }

  /**
   * 设置加载超时时间
   * @returns Promise 超时触发Resolve
   */
  protected setLoadTimeout(): Promise<void> {
    // 设置10秒加载超时
    this.loadTimeoutor && clearTimeout(this.loadTimeoutor)
    return new Promise<void>((resolve, reject) => {
      this.loadTimeoutor = setTimeout(() => {
        if (!this.ready) {
          // 手动超时不算加载失败
          this.isLoading = false
          this.log(this.name + '加载超时')
          this.loadAd()
          resolve()
        } else {
          // this.log(this.name + '加载超时已经成功')
          reject('加载成功')
        }
      }, this.loadTimeout)
    })
  }

  protected bindAdListeners(): Runnable {
    // Unbind the last listeners First
    if (this.unbindAdListeners) this.unbindAdListeners()
    if (!this.ad) return () => {}

    for (const key in this.adListeners) {
      const listener = this.adListeners[key]
      this.ad[key] && this.ad[key](listener)
    }

    this.unbindAdListeners = () => {
      if (!this.ad) return
      for (let key in this.adListeners) {
        const listener = this.adListeners[key]
        key = key.replace(/^on/, 'off')
        this.ad[key] && this.ad[key](listener)
      }
    }
  }

  protected createAd(_id: string): any {} // _id used to satisfy TypeScript noUnusedParameters

  protected onLoad(res?: any): void {
    this.log(this.name + '加载成功', res)
    AdEventBus.instance.emit(AdEventType.AdLoaded, this, this.emitOptions())
    this.ready = true
    this.isLoading = false
    this.reloadCount = 0
    if (this.showOnLoadPromise) {
      this.showOnLoadPromise.resolve && this.showOnLoadPromise.resolve()
      this.showOnLoadPromise = undefined
    }
  }


  protected onError(err?: any): void {
    this.log(this.name + '加载失败', err)
    AdEventBus.instance.emit(AdEventType.AdError, this, err)
    this.reLoad(false)
  }

  protected onClose(res?: any): void {
    this.log(this.name + '关闭')
    this.isShowed = false
    AdEventBus.instance.emit(AdEventType.AdClosed, this)
    // 外部监听的关闭事件
    this.invokeResult?.onClose?.()
    this.reLoad(true)
  }
  /**
   * onClose会触发立即加载，立即加载也需要加载间隔（createInterval），因为有些平台两次加载有时间限制
   * onError会触发非立即加载，通过createInterval和reloadCount计算重新加载间隔，如
   * createInterval = 1000
   * reloadCount = 0, delay = 1000
   * reloadCount = 1, delay = 2000
   * reloadCount = 2, delay = 3000
   * 最长加载间隔reloadMaxInterval为30秒
   * @param immediately 是否立即重新加载
   */
  protected reLoad(immediately: boolean): void {
    this.log(this.name + '重新加载')
    this.ready = false
    this.isLoading = false
    let delayMilliSeconds = this.createInterval
    if (!immediately) {
      if (this.createInterval <= 0) {
        this.log(this.name + '取消重新加载')
        return
      }
      this.reloadCount++
      delayMilliSeconds = Math.min(
        this.reloadMaxInterval, // 最大加载间隔,
        this.createInterval * this.reloadCount
      )
    }
    setTimeout(() => this.loadAd(), delayMilliSeconds)
  }

  protected onShow(): void {
    this.log(this.name, '展示成功')
    this.isShowed = true
    AdEventBus.instance.emit(AdEventType.AdShowed, this, this.emitOptions())
  }

  /**
   * 等待onload回调，加载完成后，立即展示，否则在指定时间后取消
   * @returns
   */
  protected delayShowWaitLoaded(delay: number): Promise<void> {
    this.log(this.name + '加载中')
    this.showOnLoadPromise && this.showOnLoadPromise.reject('加载超时')
    this.showOnLoadPromise = undefined
    this.showOnLoadPromise = new ManualPromise<void>();
    setTimeout(() => {
      this.showOnLoadPromise && this.showOnLoadPromise.reject('加载超时')
      this.showOnLoadPromise = undefined
    }, delay);
    return this.showOnLoadPromise.promise
  }

  async show(param: AdParam): Promise<AdInvokeResult> {
    if (!this.ad) return Promise.reject(this.name + '无效')
    if (this.isShowed) {
      this.log(this.name + '已展示')
      return Promise.resolve({ session: this })
    }
    if (!this.ready) {
      if (!this.autoLoad) this.loadAd() // 未开启自动加载的，启动加载，即外部要先调用一次，用于创建广告对象需要其他参数等
      try {
          await this.delayShowWaitLoaded(this.delayShowWaitTimeout);
      } catch (err) {
          this.log(this.name + '展示失败', JSON.stringify(err));
          throw err;
      }
      return await this.show(param);
    }
    this.log(this.name + '展示')
    return new Promise<AdInvokeResult>((resolve, reject) => {
      const showResult = this.ad.show() ?? Promise.resolve()
      showResult.then(() => {
          // 如果广告默认有 onShow事件，则无需手动触发onShow事件
          if (typeof this.ad['onShow'] !== 'function') {
            this.onShow()
          }
          this.invokeResult = { session: this }
          resolve(this.invokeResult)
        })
        .catch((err) => {
          this.log(this.name + '展示失败', JSON.stringify(err))
          reject(err)
        })
    })
  }
  close(): void {
    if (!this.ad || !this.ready || !this.isShowed) return
    this.log(this.name + '隐藏')
    this.isShowed = false
    if (typeof this.ad.hide == 'function' && this.ready) {
      this.ad.hide()
    }
  }
  protected onClick(res?: any): void {
    this.log(this.name + '点击')
    AdEventBus.instance.emit(AdEventType.AdClicked, this)
  }
  destroy(force: boolean = true): void {
    this.log(this.name + '销毁')
    this.ready = false
    this.isShowed = false
    this.isLoading = false
    if (this.unbindAdListeners) {
      this.unbindAdListeners()
      this.unbindAdListeners = undefined
    }
    if (force || (this.ad && this.autoDestroy)) {
      if (typeof this.ad.destroy == 'function') {
        this.ad.destroy()
      }
      this.ad = null
    }
  }

}
