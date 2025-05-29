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


export default class HwNativeIntersAd extends HwNativeAd {
  protected type: AdType = AdType.NativeInterstitial
}
