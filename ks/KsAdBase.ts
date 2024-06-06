import { AdHandler, AdInvokeResult, AdParam, Runnable } from "../Types";
import KsAd from "./KsAd";

export default abstract class KsAdBase implements AdHandler {
  protected name: string = 'ad base'
  private ids: string[]
  private idx = 0
  ad: any;
  unbindAdListeners: Runnable
  createInterval = 1000
  reloadCount = 0
  isShowed: boolean = false
  invokeResult: AdInvokeResult

  constructor(adStr: string) {
    let arr = adStr.split(',').filter(t => !!t)

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
    if (!this.ad) {
      KsAd.log(this.name + '创建失败')
    }
    this.unbindAdListeners = this.bindAdListeners()
  }

  bindAdListeners(): Runnable {
 
    // Unbind the last listeners First
    if (this.unbindAdListeners) this.unbindAdListeners()
    if (!this.ad) return () => {}
    let onErrorBinder = this.onError.bind(this)
    let onCloseBinder = this.onClose.bind(this)
    this.ad.onError && this.ad.onError(onErrorBinder)
    this.ad.onClose && this.ad.onClose(onCloseBinder)
    return () => {
      if (!this.ad) return
      this.ad.offError && this.ad.offError(onErrorBinder)
      this.ad.offClose && this.ad.offClose(onCloseBinder)
    }
  }

  protected abstract createAd(_id: string): any 

  protected onError(err): void {
    KsAd.log(this.name + '加载失败', JSON.stringify(err))
    this.reLoad()
  }

  protected onClose(res): void {
    KsAd.log(this.name + '关闭')
    this.isShowed = false
    this.reloadCount = 0
    this.invokeResult && this.invokeResult.onClose && this.invokeResult.onClose()
    this.reLoad()
  }
  protected reLoad(): void {
    KsAd.log(this.name + '重新加载')
    let delayMilliSeconds = this.createInterval
    this.reloadCount++
    delayMilliSeconds = Math.min(
      10000,
      this.createInterval * this.reloadCount
    )
    setTimeout(() => this.loadAd(), delayMilliSeconds)
  }
  protected onShow(): void {
    KsAd.log(this.name, '展示成功')
    this.isShowed = true
  }

  show(param: AdParam): Promise<AdInvokeResult> {
    if (!this.ad) return Promise.reject(this.name + '无效')
    if (this.isShowed) {
      KsAd.log(this.name + '已展示')
      return Promise.resolve({ session: this })
    }
    return new Promise<AdInvokeResult>((resolve, reject) => {
      this.ad
        .show()
        .then(() => {
          this.onShow()
          this.invokeResult = { session: this }
          resolve(this.invokeResult)
        })
        .catch((err) => {
          KsAd.log(this.name + '展示失败', JSON.stringify(err))
          reject(err)
        })
    })
  }
  close(): void {
    throw new Error("Method not implemented.");
  }
  destroy(): void {
    KsAd.log(this.name + '销毁')
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
