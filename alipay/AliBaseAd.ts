import { AdHandler, AdInvokeResult, AdParam, Runnable } from "../Types";
import { ManualPromise } from "../utils/AdUtils";
import AlipayAd from "./AlipayAd";

export default abstract class AliBaseAd implements AdHandler {
  protected get name(): string { return 'ad base' }
  ad: any;
  private ids: string[]
  private idx = 0
  unbindAdListeners: Runnable
  createInterval = 1000
  reloadCount = 0
  isShowed: boolean = false
  invokeResult: AdInvokeResult
  ready: boolean;
  private onLoadPromise: ManualPromise<void>
  protected autoLoad = true

  constructor(...ids: string[]) {
    this.ids = ids.filter((t) => !!t)
    this.loadAd()
  }
  loadAd() {
    if (this.ids.length === 0) return
    if (this.idx >= this.ids.length) {
      this.idx = 0
    }
    if (this.ad) {
      // 销毁之前实例
      this.destroy()
    }
    this.ad = this.createAd(this.ids[this.idx++])
    this.unbindAdListeners = this.bindAdListeners()
  }

  bindAdListeners(): Runnable {
 
    // Unbind the last listeners First
    if (this.unbindAdListeners) this.unbindAdListeners()
    if (!this.ad) return () => {}
    let onErrorBinder = this.onError.bind(this)
    let onCloseBinder = this.onClose.bind(this)
    let onLoadBinder = this.onLoad.bind(this)
    this.ad.onLoad && this.ad.onLoad(onLoadBinder)
    this.ad.onError && this.ad.onError(onErrorBinder)
    this.ad.onClose && this.ad.onClose(onCloseBinder)
    return () => {
      if (!this.ad) return
      this.ad.offError && this.ad.offError(onErrorBinder)
      this.ad.offClose && this.ad.offClose(onCloseBinder)
      this.ad.offLoad && this.ad.offLoad(onCloseBinder)
    }
  }

  protected createAd(_id: string): any {} // _id used to satisfy TypeScript noUnusedParameters

  protected onLoad(res): void {
    AlipayAd.log(this.name + '加载成功')
    this.ready = true
    this.reloadCount = 0
    if (this.onLoadPromise) {
      this.onLoadPromise.resolve && this.onLoadPromise.resolve()
      this.onLoadPromise = undefined
    }
  }


  protected onError(err): void {
    AlipayAd.log(this.name + '加载失败', JSON.stringify(err))
    this.reLoad(false)
  }

  protected onClose(res): void {
    AlipayAd.log(this.name + '关闭')
    this.isShowed = false
    this.ready = false
    this.invokeResult && this.invokeResult.onClose && this.invokeResult.onClose()
    this.reLoad(true)
  }
  protected reLoad(immediately: boolean): void {
    AlipayAd.log(this.name + '重新加载')
    let delayMilliSeconds = this.createInterval
    if (!immediately) {
        this.reloadCount++
        delayMilliSeconds = Math.min(
          10000,
          this.createInterval * this.reloadCount
        )
    }
    setTimeout(() => this.loadAd(), delayMilliSeconds)
  }
  protected onShow(): void {
    AlipayAd.log(this.name, '展示成功')
    this.isShowed = true
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

  show(param: AdParam): Promise<AdInvokeResult> {
    if (!this.ad) return Promise.reject(this.name + '无效')
    if (this.isShowed) {
      AlipayAd.log(this.name + '已展示')
      return Promise.resolve({ session: this })
    }
    if (!this.ready) {
      if (!this.autoLoad) this.loadAd() // 未开启自动加载的，启动加载，即外部要先调用一次，用于创建广告对象需要其他参数等
      AlipayAd.log(this.name + '加载中')
      return this.noReadyDelayShow(1000).catch(err => {
        AlipayAd.log(this.name + '展示失败', JSON.stringify(err))
        throw err;
      }).then(() => this.show(param))
    }
    AlipayAd.log(this.name + '展示')
    return new Promise<AdInvokeResult>((resolve, reject) => {
      this.ad
        .show()
        .then(() => {
          this.onShow()
          this.invokeResult = { session: this }
          resolve(this.invokeResult)
        })
        .catch((err) => {
          AlipayAd.log(this.name + '展示失败', JSON.stringify(err))
          reject(err)
        })
    })
  }
  close(): void {
    if (!this.ad || !this.ready || !this.isShowed) return
    AlipayAd.log(this.name + '隐藏')
    this.isShowed = false
    this.ad.hide()
  }
  destroy(): void {
    AlipayAd.log(this.name + '销毁')
    this.ready = false
    this.isShowed = false
    if (this.unbindAdListeners) {
      this.unbindAdListeners()
      this.unbindAdListeners = undefined
    }
    if (this.ad) {
      if (typeof this.ad.destroy == 'function') {
        this.ad.destroy()
      }
      this.ad = null
    }
  }

}
