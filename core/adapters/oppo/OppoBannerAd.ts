/**
 * Banner广告
 */

import { AdParam, AdInvokeResult, Runnable, AdType } from "../../Types";
import OppoBaseAd from "./OppoBaseAd";

export default class OppoBannerAd extends OppoBaseAd {
  constructor(...ids: any[]) {
    super(AdType.Banner, ...ids)
  }
  
  protected getAdListeners(): Record<string, Runnable> {
    const listeners = super.getAdListeners()
    // banner没有关闭事件，点击关闭按钮也会触发 onHide 事件
    listeners['onHide'] = listeners['onClose']
    delete listeners['onClose']
    return listeners
  }
  protected createAd(_id: string): any {
    this.ready = true // oppo 广告通过show方法加载，加载成功会立即展示
    if (!this.ad) {
      // 注意：banner广告的高度和宽度需要和游戏的高度和宽度一致，否则会出现部分区域无法点击的问题
      return globalThis.qg.createBannerAd({
        adUnitId: _id,
        style: {
          top: 300,
          left: 0,
          width: this.properties.safeArea.width,
          height: 300,
        },
      })
    }
    return this.ad
  }
  
  protected onLoad(res?: any): void {
    // 因为banner广告是通过show拉取的，所以onLoad里面重新执行onShow，保证事件顺序一致
    super.onLoad(res)
    super.onShow()
  }

  protected onShow(): void {
    // 取消默认的onShow事件，改为加载超时，且超时后要重新调用 show，因为banner广告是通过show拉取的
    this.setLoadTimeout().then(() => {
      this.show({})
    })
  }
}
