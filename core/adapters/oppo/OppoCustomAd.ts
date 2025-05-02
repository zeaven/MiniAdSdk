/**
 * 原生模板广告
 */

import { Runnable } from '../../Types'
import OppoBaseAd from './OppoBaseAd'

export default class OppoCustomAd extends OppoBaseAd {
  get name(): string {
      return '原生模板广告'
  }
  protected getAdListeners(): Record<string, Runnable> {
    const listeners = super.getAdListeners()
    listeners['onHide'] = this.onClose.bind(this)
    // 原生模板有onShow事件，去掉自动触发onShow事件，改为onOpen
    listeners['onShow'] = this.onOpen.bind(this)
    return listeners
  }
  protected createAd(_id: string): any {
    if (globalThis.qg.createCustomAd)
      return globalThis.qg.createCustomAd({
        adUnitId: _id,
        style: {
          top: 0,
          left: 0,
          width: this.properties.screenWidth,
        }
      })
  }
  protected onShow(): void {
    // 忽略调用show方法触发的onShow事件
  }
  protected onOpen(): void {
    this.log('onOpen')
    super.onShow()
  }
}
