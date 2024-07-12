import { AdHandler, AdInvokeResult, AdParam, Runnable } from "../Types";
import BoxAd from "./BoxAd";

export default abstract class BoxBaseAd implements AdHandler {
  protected get name(): string { return 'ad base' }
  ad: any;
  unbindAdListeners: Runnable
  createInterval = 1000
  reloadCount = 0
  isShowed: boolean = false
  invokeResult: AdInvokeResult
  ready: boolean;
  private onLoadPromise: any
  attrs: Object;
  protected autoLoad = true

  constructor(attrs?: Object) {
    this.attrs = attrs
    this.loadAd()
  }
  loadAd() {
   
    if (this.ad) {
      // 销毁之前实例
      this.destroy()
    }
    this.ad = this.createAd(this.attrs)
    if (!this.ad) {
      BoxAd.log(this.name + '创建失败')
    }
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

  protected abstract createAd(attrs?: Object): any 

  protected onLoad(res): void {
    BoxAd.log(this.name + '加载成功')
    this.ready = true
    this.reloadCount = 0
    if (this.onLoadPromise) {
      this.onLoadPromise.resolve && this.onLoadPromise.resolve()
      this.onLoadPromise = undefined
    }
  }


  protected onError(err): void {
    BoxAd.log(this.name + '加载失败', JSON.stringify(err))
    this.reLoad(false)
  }

  protected onClose(res): void {
    BoxAd.log(this.name + '关闭')
    this.isShowed = false
    this.ready = false
    this.invokeResult && this.invokeResult.onClose && this.invokeResult.onClose()
    this.reLoad(true)
  }
  protected reLoad(immediately: boolean): void {
    BoxAd.log(this.name + '重新加载')
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
    BoxAd.log(this.name, '展示成功')
    this.isShowed = true
  }

  /**
   * 等待onload回调，加载完成后，立即展示，否则在1s时间后取消
   * @returns
   */
  protected noReadyDelayShow(delay: number): Promise<AdInvokeResult> {
    if (this.onLoadPromise) {
      this.onLoadPromise.reject && this.onLoadPromise.reject()
      this.onLoadPromise = undefined
    }
    return new Promise((resolve, reject) => {
      this.onLoadPromise = { resolve, reject }
      setTimeout(() => {
        this.onLoadPromise = undefined
        reject('加载超时')
      }, delay)
    })
  }

  show(param: AdParam): Promise<AdInvokeResult> {
    if (!this.ad) return Promise.reject(this.name + '无效')
    if (this.isShowed) {
      BoxAd.log(this.name + '已展示')
      return Promise.resolve({ session: this })
    }
    if (!this.ready) {
      if (!this.autoLoad) this.loadAd() // 未开启自动加载的，启动加载，即外部要先调用一次，用于创建广告对象需要其他参数等
      BoxAd.log(this.name + '加载中')
      return this.noReadyDelayShow(1000).catch(err => {
        BoxAd.log(this.name + '展示失败', JSON.stringify(err))
        throw err;
      }).then(() => this.show(param))
    }
    BoxAd.log(this.name + '展示')
    return new Promise<AdInvokeResult>((resolve, reject) => {
      this.ad
        .show()
        .then(() => {
          this.onShow()
          this.invokeResult = { session: this }
          resolve(this.invokeResult)
        })
        .catch((err) => {
          BoxAd.log(this.name + '展示失败', JSON.stringify(err))
          reject(err)
        })
    })
  }
  close(): void {
    if (!this.ad || !this.ready || !this.isShowed) return
    BoxAd.log(this.name + '隐藏')
    this.isShowed = false
    this.ad.hide()
  }
  destroy(): void {
    BoxAd.log(this.name + '销毁')
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
