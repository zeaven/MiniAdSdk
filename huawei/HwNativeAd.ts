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

import { AdParam, AdInvokeResult } from "../Types";
import HwBaseAd from "./HwBaseAd";

export default class HwNativeAd extends HwBaseAd {
  protected get name(): string { return '原生广告' }
  private adData: any
  private node: cc.Node

  constructor(...ids: string[]) {
    super(...ids)
    this.node = new cc.Node()
  }

  protected createAd(_id: string): any {
    if (!this.ad) {
      setTimeout(() => {
        this.ad && this.ad.load()
      }, 1000);
      return qg.createNativeAd({
        adUnitId: _id,
      })
    } else {
      this.ad.load()
    }
    return this.ad
  }

  protected onLoad(res: any): void {
    super.onLoad(res)
    if (res.adList.length > 0) {
      this.adData = res.adList[0]
      cc.assetManager.loadRemote(this.adData.imgUrlList,(err, texture: cc.Texture2D) => {
        if (texture) {
          this.node.addComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture)
        }
      })
    }
  }

  show(param: AdParam): Promise<AdInvokeResult> {
    return super.show(param).then(res => {
      res.node = this.node
      res.showDownloadButton = () => this.showDownloadButton()
      return res
    })
  }

  private showDownloadButton() {
    this.ad.showDownloadButton({
        adId : this.adData.adId,
        style : {
            left:300,
            top:500,
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

      const parent: cc.Node = this.node.getParent()
      if (parent) {
        parent.removeChild(this.node)
      }
  }
}
