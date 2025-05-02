/**
 * 原生模板广告
 */

import { Runnable } from '../../Types'
import OppoBaseAd from './OppoBaseAd'
import log from "./OppoLog"

export default class OppoBoxBannerAd extends OppoBaseAd {
  get name(): string {
      return '盒子横幅广告'
  }
  protected getAdListeners(): Record<string, Runnable> {
    const listeners = super.getAdListeners()
    // 原生模板有onShow事件，去掉自动触发onShow事件，改为onOpen
    listeners['onShow'] = this.onOpen.bind(this)
    return listeners
  }
  protected createAd(_id: string): any {
    if (globalThis.qg.createGameBannerAd) {
      if (!this.ad) {
        return globalThis.qg.createGameBannerAd({
          adUnitId: _id,
          style: {
            top: 300,
            left: 0,
            orientation: "vertical",
          },
        })
      }
      return this.ad
    }
    log('不支持的盒子广告类型')
  }
  protected onShow(): void {
    // 忽略调用show方法触发的onShow事件
  }
  protected onOpen(): void {
    this.log('onOpen')
    super.onShow()
  }
}
