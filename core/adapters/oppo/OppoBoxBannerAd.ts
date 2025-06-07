/**
 * 原生模板广告
 */

import { AdInvokeResult, AdParam, AdType, Runnable } from '../../Types'
import OppoBaseAd from './OppoBaseAd'
import log from "./OppoLog"

export default class OppoBoxBannerAd extends OppoBaseAd {
  constructor(...ids: any[]) {
    super(AdType.Box, ...ids)
  }
  protected getAdListeners(): Record<string, Runnable> {
    const listeners = super.getAdListeners()
    // TODO: 文档没有 onHide/onClose 事件
    return listeners
  }
  protected createAd(_id: string): any {
    this.ready = true // oppo 广告通过show方法加载，加载成功会立即展示并触发onLoad事件
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
  
  /**
   * 自动拉取广告，并触发 onLoad 事件和 onShow 事件
   */
  show(param: AdParam): Promise<AdInvokeResult> {
    // 因为广告是通过show拉取的，所以show里面设置加载超时，且超时后要重新调用 show
    this.setLoadTimeout().then(() => {
      this.show({})
    })
    return super.show(param)
  }
}
