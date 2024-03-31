import { AdHandler, AdInvokeResult, AdParam } from '../Types'
import VivoAd from './VivoAd'

export default class VivoBaseAd implements AdHandler {
  protected name = 'base ad'
  private ids: string[]
  private idx = 0
  protected ad: any
  protected ready = false
  protected properties?: any
  protected createInterval = 3000
  private unbindAdListeners?: (() => void)
  protected autoUnbindListener = true
  private reloadCount = 0
  private _isShowed = false
  protected invokeResult?: AdInvokeResult
  public get isShowed(): boolean {
    return this._isShowed
  }
  protected set isShowed(val: boolean) {
    this._isShowed = val
  }
  protected autoLoad = true
  private onLoadPromise: any

  constructor(...ids: any[]) {
    this.ids = ids.filter((t) => !!t)
    if (this.ids[this.ids.length-1] === 'object') {
      this.properties = this.ids.pop()
    }
    if (this.autoLoad) this.loadAd()
  }

  protected loadAd() {
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

  protected createAd(_id: string): any {} // _id used to satisfy TypeScript noUnusedParameters

  private bindAdListeners(): () => void {
    if (!this.autoUnbindListener && this.unbindAdListeners) {
      return this.unbindAdListeners
    }
    // Unbind the last listeners First
    if (this.unbindAdListeners) this.unbindAdListeners()
    if (!this.ad) return () => {}
    let onErrorBinder = this.onError.bind(this)
    let onLoadBinder = this.onLoad.bind(this)
    let onCloseBinder = this.onClose.bind(this)
    this.ad.onError && this.ad.onError(onErrorBinder)
    this.ad.onLoad && this.ad.onLoad(onLoadBinder)
    this.ad.onClose && this.ad.onClose(onCloseBinder)
    return () => {
      if (!this.ad) return
      this.ad.offError && this.ad.offError(onErrorBinder)
      this.ad.offLoad && this.ad.offLoad(onLoadBinder)
      this.ad.offClose && this.ad.offClose(onCloseBinder)
    }
  }

  protected onLoad(res): void {
    VivoAd.log(this.name + '加载成功')
    this.ready = true
    this.reloadCount = 0
    if (this.onLoadPromise) {
      this.onLoadPromise.resolve && this.onLoadPromise.resolve()
      this.onLoadPromise = undefined
    }
  }

  protected onError(err): void {
    VivoAd.log(this.name + '加载失败', JSON.stringify(err))
    // 加载失败发起重试
    this.reLoad(false)
  }

  protected onClose(res): void {
    VivoAd.log(this.name + '关闭')
    this.ready = false
    this.isShowed = false
    this.invokeResult && this.invokeResult.onClose && this.invokeResult.onClose()
    this.reLoad(true)
  }
  protected reLoad(immediately: boolean): void {
    VivoAd.log(this.name + '重新加载')
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
    VivoAd.log(this.name, '展示成功')
    this.isShowed = true
  }

  /**
   * 等待onload回调，加载完成后，立即展示，否则在1s时间后取消
   * @returns
   */
  protected noReadyDelayShow(param: AdParam): Promise<AdInvokeResult> {
    if (this.onLoadPromise) {
      this.onLoadPromise.reject && this.onLoadPromise.reject()
      this.onLoadPromise = undefined
    }
    return new Promise((resolve, reject) => {
      this.onLoadPromise = { resolve, reject }
      setTimeout(() => {
        this.onLoadPromise = undefined
        reject('加载超时')
      }, 1000)
    }).then(() => this.show(param))
  }

  public show(param: AdParam): Promise<AdInvokeResult> {
    if (!this.ad) return Promise.reject(this.name + '无效')
    if (this.isShowed) {
      VivoAd.log(this.name + '已展示')
      return Promise.resolve({ session: this })
    }
    if (!this.ready) {
      if (!this.autoLoad) this.loadAd() // 未开启自动加载的，启动加载，即外部要先调用一次，用于创建广告对象需要其他参数等
      VivoAd.log(this.name + '加载中')
      return this.noReadyDelayShow(param).catch(err => {
        VivoAd.log(this.name + '展示失败', JSON.stringify(err))
        throw err;
      })
    }
    VivoAd.log(this.name + '展示')
    return new Promise<AdInvokeResult>((resolve, reject) => {
      this.ad
        .show()
        .then(() => {
          this.onShow()
          this.invokeResult = { session: this }
          resolve(this.invokeResult)
        })
        .catch((err) => {
          VivoAd.log(this.name + '展示失败', JSON.stringify(err))
          reject(err)
        })
    })
  }
  public close(): void {
    if (!this.ad || !this.ready || !this.isShowed) return
    VivoAd.log(this.name + '隐藏')
    this.isShowed = false
    this.ad.hide()
  }

  public destroy(): void {
    VivoAd.log(this.name + '销毁')
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
