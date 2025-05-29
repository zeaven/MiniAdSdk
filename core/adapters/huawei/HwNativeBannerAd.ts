/**
 * 原生广告
 * 使用：
 * AdSdk.instance.showNative().then(res => {
 *    // 添加原生广告节点到当前场景，即展示原生广告
 *    this.node.addChild(res.node)
 *    // 显示下载控件
 *    res.showDownloadButton()
 *    // 关闭广告
 *    res.session.close()
 * })
 * 
 */

import { AdType } from "../../Types"
import HwNativeAd from "./HwNativeAd"
import { NativeAdData, NativeAdView } from "./HwNativeLayout"


export default class HwNativeBannerAd extends HwNativeAd {
  protected type: AdType = AdType.NativeBanner

  override createAdView(adData: NativeAdData): NativeAdView {
    const adView = super.createAdView(adData)
    const c = adView.node.getChildByName('AdContainer')
    // 读取 this.properties 中的参数 gravity 来设置广告的位置
    const gravity = this.properties.gravity || 'bottom'
    if (gravity === 'bottom') {
      c.setPosition(0, -cc.winSize.height * 0.5)
    } else if (gravity === 'top') {
      c.setPosition(0, cc.winSize.height * 0.5)
    }
    return adView
  }
}
