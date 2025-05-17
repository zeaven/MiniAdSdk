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

import { AdParam, AdInvokeResult } from "../../Types"
import HwBaseAd from "./HwBaseAd"
import HwNativeLayout, { NativeAdData, NativeAdView } from "./HwNativeLayout"


export default class HwNativeAd extends HwBaseAd {
  private nativeLayout: HwNativeLayout
  private adView: NativeAdView
  get name(): string { return '原生广告' }
  private adData: NativeAdData

  constructor(...ids: any[]) {
    super(...ids)
    this.nativeLayout = new HwNativeLayout()
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
    const parentSize = cc.size(this.properties?.safeArea.width || cc.winSize.width * 0.8, this.properties?.safeArea.height || cc.winSize.height * 0.8)
    this.adData.width = parentSize.width *  (parentSize.height > parentSize.width ? 1: 0.6)
    this.adData.height =  parentSize.height * (parentSize.height > parentSize.width ? 0.6: 1)
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
    this.ad.startDownload({adId: this.adData.adId})
    setTimeout(() => this.close(), 500)
  }

  show(param: AdParam): Promise<AdInvokeResult> {
    return super.show(param).then(res => {
      if (!this.adData) {
        return Promise.reject('没有缓存的广告')
      }
      this.adView = this.createAdView(this.adData)

      res.node = this.adView.node
      // 暴露额外方法，方便外部控制广告
      res.showDownloadButton = () => this.showDownloadButton()
      res.disableCloseBtn = () => this.adView.disableCloseBtn()
      this.ad.reportAdShow({adId: this.adData.adId})
      return res
    })
  }
  
  protected createAdView(adData: NativeAdData): NativeAdView {
    const adView = this.nativeLayout.createLayout(adData)
    adView.onClick = this.onClick.bind(this)
    adView.onClose = this.close.bind(this)
    adView.onLink = () => {
      this.ad.reportAdClick({adId: adData.adId})
      this.ad.startDownload({adId: adData.adId})
    }
    return adView
  }

  protected showDownloadButton() {
    this.adView.disableLinkBtn()
    // 通过 this.node 节点的位置和大小，设置下载按钮位置，位于底部中间
    const height = this.adData.height
    const left = ((this.properties?.windowWidth || cc.winSize.width) - 100) * (this.properties?.pixelRatio || 1)
    const top = ((this.properties?.windowHeight || cc.winSize.height) / 2 + (height / 6)) * (this.properties?.pixelRatio || 1)
    
    // 显示下载按钮
    this.ad.showDownloadButton({
        adId : this.adData.adId,
        style : {
            left:left,
            top:top,
            heightType:'normal',
            width:300,
            minWidth:200,
            maxWidth:500,
            textSize:50,
            horizontalPadding:50,
            cornerRadius:22,
            normalTextColor:'#FFFFFF',
            normalBackground:'#5291FF',
            pressedColor:'#0A59F7',
            normalStroke:5,
            normalStrokeCorlor:'#FF000000',
            processingTextColor:'#5291FF',
            processingBackground:'#0F000000',
            processingColor:'#000000',
            processingStroke:10,
            processingStrokeCorlor:'#0A59F7',
            installingTextColor:'#000000',
            installingBackground:'#FFFFFF',
            installingStroke:15,
            installingStrokeCorlor:'#5291FF'
        }
    })
  }

  close(): void {
      super.close()
      this.ad.hideDownloadButton({adId: this.adData.adId})

      const parent: cc.Node = this.adView.node.getParent()
      if (parent) {
        parent.removeChild(this.adView.node)
        this.adView.node.destroy()
        this.adView = null
      }
      // 触发 onClose 回调
      this.onClose(null)
  }
}

