/**
 * 原生模板广告
 */

import { AdInvokeResult, AdParam, Runnable } from '../../Types'
import OppoBaseAd from './OppoBaseAd'

export default class OppoCustomAd extends OppoBaseAd {
  get name(): string {
      return '原生模板广告'
  }
  protected getAdListeners(): Record<string, Runnable> {
    const listeners = super.getAdListeners()
    listeners['onHide'] = listeners['onClose']
    delete listeners['onClose']
    return listeners
  }
  protected createAd(_id: string): any {
    this.ready = true // 默认加载
    if (globalThis.qg.createCustomAd)
      this.ready = true // 通过 show 拉取广告
      return globalThis.qg.createCustomAd({
        adUnitId: _id,
        style: {
          top: 0,
          left: 0,
          width: this.properties.screenWidth,
        }
      })
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
