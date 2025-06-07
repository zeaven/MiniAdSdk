import { AdParam, AdInvokeResult, AdEventType, AdType } from "../../Types";
import AdEventBus from "../../utils/AdEventBus";
import VivoBaseAd from "./VivoBaseAd";

export default class VivoNativeAd extends VivoBaseAd {
  constructor(...ids: any[]) {
    super(AdType.Native,...ids)
  }
  private adInfo: any
  protected createAd(_id: string) {
    this.ready = true // 默认加载
    if (globalThis.qg.createNewNativeAd) {
        if (!this.ad) {
            this.ad = globalThis.qg.createNewNativeAd({
              posId: _id,
            })
            const show = this.ad.show.bind(this.ad)
            this.ad.show = () => {
                show(this.adInfo)
            }
        }
    }
    return this.ad
  }

  protected onLoad(res?: any): void {
      super.onLoad(res)
      if (res && res.adList) {
        this.adInfo = {
            adId: res.adList[0].adId,
            formType: res.adList[0].formType[0],
            style: {
                gravity: 'center',
            }
        }
      }
  }

  protected onError(err?: any): void {
    this.log(this.name + '加载失败', err.errCode, err.errMsg)
    AdEventBus.instance.emit(AdEventType.AdError, this, err)
    this.reLoad(false)
  }

}