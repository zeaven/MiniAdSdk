import { AdEventType, AdHandler, AdInvokeResult, AdParam, Runnable } from "../Types";
import AdEventBus from "../utils/AdEventBus";
import { ManualPromise } from "../utils/AdUtils";

export default abstract class AdBase implements AdHandler {
  get name(): string { return 'ad base' }
  protected abstract log(...msg: any[]): void
  protected ad: any; // 广告对象
  protected ids: string[] // 广告id列表
  private idx = 0 // 广告id索引
  protected unbindAdListeners: Runnable
  protected createInterval = 1000 // 重新加载间隔 <=0，并且非立即加载，则为取消重新加载
  protected reloadCount = 0 // 重新加载次数
  protected isShowed: boolean = false // 是否展示
  protected invokeResult: AdInvokeResult // 当前展示的回调
  protected ready: boolean; // 是否准备好
  private onLoadPromise: ManualPromise<void> // 等待onload回调，加载完成后，立即展示，否则在1s时间后取消
  protected autoLoad = true // 是否自动加载
  protected properties?: any // 广告属性
  protected autoDestroy = true // 是否自动销毁，单例广告设置为false，如：激励视频
  protected isLoading = false // 是否正在加载
  protected adListeners: Record<string, Runnable> = {}  // 广告事件监听

  constructor(...ids: any[]) {
    this.ids = ids.filter((t) => !!t)
    if (typeof this.ids[this.ids.length-1] === 'object') {
      this.properties = this.ids.pop()
    }
    this.log(this.name + '初始化', this.ids, this.properties)

    this.adListeners = {
      onLoad: this.onLoad.bind(this),
      onError: this.onError.bind(this),
      onClose: this.onClose.bind(this),
    }

    this.autoLoad && this.loadAd()
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
      if (!this.isLoading && typeof this.ad.load == 'function') {
        this.ad.load()
        this.isLoading = true
      }
      this.unbindAdListeners = this.bindAdListeners()
    }
  }

  protected bindAdListeners(): Runnable {
 
    // Unbind the last listeners First
    if (this.unbindAdListeners) this.unbindAdListeners()
    if (!this.ad) return () => {}

    for (const key in this.adListeners) {
      const listener = this.adListeners[key]
      this.ad[key] && this.ad[key](listener)
    }

    return () => {
      if (!this.ad) return
      for (let key in this.adListeners) {
        const listener = this.adListeners[key]
        key = key.replace(/^on/, 'off')
        this.ad[key] && this.ad[key](listener)
      }
    }
  }

  protected createAd(_id: string): any {} // _id used to satisfy TypeScript noUnusedParameters

  protected onLoad(res): void {
    this.log(this.name + '加载成功')
    AdEventBus.instance.emit(AdEventType.AdLoaded, this)
    this.ready = true
    this.isLoading = false
    this.reloadCount = 0
    if (this.onLoadPromise) {
      this.onLoadPromise.resolve && this.onLoadPromise.resolve()
      this.onLoadPromise = undefined
    }
  }


  protected onError(err): void {
    this.log(this.name + '加载失败', JSON.stringify(err))
    AdEventBus.instance.emit(AdEventType.AdError, this, err)
    this.reLoad(false)
  }

  protected onClose(res): void {
    this.log(this.name + '关闭')
    this.isShowed = false
    this.ready = false
    AdEventBus.instance.emit(AdEventType.AdClosed, this)
    this.invokeResult && this.invokeResult.onClose && this.invokeResult.onClose()
    this.reLoad(true)
  }
  /**
   * !!!注意：如果重新加载间隔 createInterval<=0，并且非立即加载，则为取消重新加载
   * @param immediately 是否立即重新加载
   */
  protected reLoad(immediately: boolean): void {
    this.log(this.name + '重新加载')
    let delayMilliSeconds = this.createInterval
    if (!immediately) {
      if (this.createInterval <= 0) {
        this.log(this.name + '取消重新加载')
        return
      }
      this.reloadCount++
      delayMilliSeconds = Math.min(
        10000,
        this.createInterval * this.reloadCount
      )
    }
    setTimeout(() => this.loadAd(), delayMilliSeconds)
  }
  protected onShow(): void {
    this.log(this.name, '展示成功')
    this.isShowed = true
    AdEventBus.instance.emit(AdEventType.AdShowed, this)
  }

  /**
   * 等待onload回调，加载完成后，立即展示，否则在1s时间后取消
   * @returns
   */
  protected noReadyDelayShow(delay: number): Promise<void> {
    if (this.onLoadPromise) {
      this.onLoadPromise.reject && this.onLoadPromise.reject('加载超时')
      this.onLoadPromise = undefined
    }
    this.onLoadPromise = new ManualPromise<void>();
    setTimeout(() => {
      this.onLoadPromise.reject('加载超时')
      this.onLoadPromise = undefined
    }, delay);
    return this.onLoadPromise.promise
  }

  async show(param: AdParam): Promise<AdInvokeResult> {
    if (!this.ad) return Promise.reject(this.name + '无效')
    if (this.isShowed) {
      this.log(this.name + '已展示')
      return Promise.resolve({ session: this })
    }
    if (!this.ready) {
      if (!this.autoLoad) this.loadAd() // 未开启自动加载的，启动加载，即外部要先调用一次，用于创建广告对象需要其他参数等
      this.log(this.name + '加载中')
      try {
            await this.noReadyDelayShow(2000);
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
          this.onShow()
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
    if (typeof this.ad.hide == 'function') {
      this.ad.hide()
    }
  }
  destroy(force: boolean = true): void {
    this.log(this.name + '销毁')
    this.ready = false
    this.isShowed = false
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
