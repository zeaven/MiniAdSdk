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

import { AdParam, AdInvokeResult, Runnable, AdType } from "../../Types"
import HwBaseAd from "./HwBaseAd"
import HwNativeLayout, { NativeAdData, NativeAdView } from "./HwNativeLayout"


export default class HwNativeAd extends HwBaseAd {
  private nativeLayout: HwNativeLayout
  private adView: NativeAdView
  protected type: AdType = AdType.Native
  private adData: NativeAdData

  constructor(...ids: any[]) {
    super(...ids)
    this.nativeLayout = new HwNativeLayout()
  }

  protected getAdListeners(): Record<string, Runnable> {
    const listener = super.getAdListeners()
    listener['onStatusChanged'] = this.onStatusChanged.bind(this)
    listener['onDownloadProgress'] = this.onDownloadProgress.bind(this)
    return listener
  }

  private onStatusChanged(res: any) {
    this.log("onStatusChanged", res)
   
  }
  private onDownloadProgress(res: any) {
    this.log("onDownloadProgress", res)
  }

  protected createAd(_id: string): any {
    if (!this.ad) {
      const ad = qg.createNativeAd({
        adUnitId: _id,
      })
      ad.show = () => {}  // 原生广告没有 ad.show方法，这里补全
      this.ad = ad
    }
    return this.ad
  }

  protected onLoad(res?: any) {
    super.onLoad(res)
    this.adData = this.convertData(res)
    if (!this.adData.adId) {
      return
    }
    this.ready = true
    this.nativeLayout.preLoad(this.adData)
    
  }
  /**
   * 
   * @param res {"adList":[{"videoUrlList":[],"privacyUrl":"https://h5hosting-drcn.dbankcdn.cn/cch5/PPS/ssp-privacy-url/index.html?src=http%3A%2F%2Fm.pinduoduo.net%2Fprivate_policy.html","videoRatio":[],"imgUrlList":["https://images.pinduoduo.com/marketing_api/2025-02-28/2da6959ef7724cf2ab88e5c049846bef.png","https://images.pinduoduo.com/marketing_api/2025-02-28/b58d9e12-8559-11ef-8f8f-0a580a4c1c74.png","https://images.pinduoduo.com/marketing_api/2025-02-28/89511dd8-8559-11ef-9ea2-0a580a4e244b.png"],"appName":"拼多多","permissionUrl":"https://appgallery.huawei.com/open/permission?packageName=com.xunmeng.pinduoduo&mediaPackageName=com.game.kddnd.rg.huawei","source":"拼多多","appDetailUrl":"https://appgallery.huawei.com/#/app_simple/C10374976","title":"上拼多多领红包，最高100元向您招手！","versionName":"7.56.0","logoUrl":"","adId":"bcccdf09-64c7-4260-9fbc-0cf7c7d9ca9f","creativeType":108,"interactionType":0,"developerName":"上海寻梦信息技术有限公司","clickBtnTxt
   */
  convertData(res: any): NativeAdData {
    const adList = res ? res.adList : []
    if (!adList || adList.length === 0) {
      return {} as NativeAdData
    }

    return adList[0] as NativeAdData
  }

  protected onClick(res?: any) {
    super.onClick(res)
    this.ad.reportAdClick({adId: this.adData.adId})
    // 跳转落地页
    this.ad.startDownload({adId: this.adData.adId})
    setTimeout(() => this.close(), 500)
  }

  show(param: AdParam): Promise<AdInvokeResult> {
    return super.show(param).then(res => {
      if (!this.adData) {
        return Promise.reject('没有缓存的广告')
      }
      this.adView = this.createAdView(this.adData)

      res.adView = this.adView
      // 暴露额外方法，方便外部控制广告
      if (param.showDownloadButton) {
        this.showDownloadButton()
      }
      if (param.disableCloseBtn) {
        this.adView.disableCloseBtn()
      }
      this.ad.reportAdShow({adId: this.adData.adId})
      return res
    })
  }
  
  protected createAdView(adData: NativeAdData): NativeAdView {
    // 把屏幕大小传入
    this.adData.width = this.properties?.safeArea.width || cc.winSize.width
    this.adData.height = this.properties?.safeArea.height || cc.winSize.height 
    const adView = this.nativeLayout.createLayout(adData, this.type)
    adView.onClick = this.onClick.bind(this)
    adView.onClose = this.close.bind(this)
    // 打开应用市场详情页
    adView.onLink = adView.openApp
    return adView
  }

  protected showDownloadButton() {
    // this.adView.disableLinkBtn()
    // 通过 this.node 节点的位置和大小，设置下载按钮位置，位于底部中间
    const width = cc.winSize.width
    const height = this.adData.height
    const left = ((this.properties?.windowWidth || cc.winSize.width) * 0.5 - 50) * (this.properties?.pixelRatio || 1)
    const top = ((this.properties?.windowHeight || cc.winSize.height) / 2) * (this.properties?.pixelRatio || 1)
    
    // 显示下载按钮
    this.ad.showDownloadButton({
        adId : this.adData.adId,
        style : {
            left:left,
            top:top,
            heightType:'normal',
            width:width,
            fixedWidth: true,
            minWidth:599,
            maxWidth:width,
            textSize:1,
            horizontalPadding:0,
            cornerRadius:0,
            normalTextColor:'#FFFFFFFF',
            normalBackground:'#FFFFFFFF',
            pressedColor:'#FFFFFFFF',
            normalStroke:5,
            normalStrokeCorlor:'#EEEEEEFF',
            processingTextColor:'#EEEEEEFFF',
            processingBackground:'#EEEEEEFF',
            processingColor:'#EEEEEEFF',
            processingStroke:10,
            processingStrokeCorlor:'#EEEEEEFF',
            installingTextColor:'#EEEEEEFF',
            installingBackground:'#EEEEEEFF',
            installingStroke:15,
            installingStrokeCorlor:'#EEEEEEFF'
        }
    })
  }

  close(): void {
    debugger
      super.close()
      this.ad.hideDownloadButton({adId: this.adData.adId})
      this.adView = null
      // 触发 onClose 回调
      this.onClose(null)
  }
}

