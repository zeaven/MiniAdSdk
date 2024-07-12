import AdSdk from "../AdSdk"
import { AdContext, AdEvent, AdEventHandler, AdType } from "../Types"

/**
 * 配置广告绑定逻辑
 */
export default class ConfigBinder {
  private static _instance: ConfigBinder
  static get instance(): ConfigBinder {
    if (!this._instance) {
      this._instance = new ConfigBinder
    }
    return this._instance
  }

  init() {
    AdSdk.instance.on(AdEvent.BannerShow, this.onBannerShow, this)
    AdSdk.instance.on(AdEvent.BannerHide, this.onBannerHide, this)
    AdSdk.instance.on(AdType.Banner,this.onBanner, this)

    AdSdk.instance.on(AdEvent.CustomShow, this.onCustomShow, this)
    AdSdk.instance.on(AdEvent.CustomHide, this.onCustomHide, this)
    AdSdk.instance.on(AdType.Custom,this.onCustom, this)

    AdSdk.instance.on(AdEvent.InterstitialShow, this.onInterstitialShow, this)
    AdSdk.instance.on(AdType.Interstitial,this.onInterstitial, this)

    AdSdk.instance.on(AdEvent.NativeShow, this.onNativeShow, this)
    AdSdk.instance.on(AdType.Native,this.onNative, this)

    // combo事件需要用户自行定义怎么处理，一般用于判断配置多种广告类型，应该触发哪种方法
    // 默认实现是优先：原生模板 -> 插屏 -> Banner
    AdSdk.instance.on(AdEvent.ComboShow, this.onComboShow, this)
    AdSdk.instance.on(AdEvent.ComboHide, this.onComboHide, this)
    // AdSdk.instance.on(AdType.Combo,this.onCombo, this)
  }


  onBannerShow(context: AdContext, data: string): void {
    AdSdk.instance.showBanner()
  }
  onBannerHide(context: AdContext, data: string): void {
    AdSdk.instance.hideBanner();
  }
  onBanner(context: AdContext, data: string): void {
    if (!data) return;
    if (data.includes('show')) {
      AdSdk.instance.showBanner()
    } else if (data.includes('hide')) {
      AdSdk.instance.hideBanner()
    }
  }

  onCustomShow(context: AdContext, data: string): void {
    AdSdk.instance.showCustom()
  }
  onCustomHide(context: AdContext, data: string): void {
    AdSdk.instance.hideCustom()
  }
  onCustom(context: AdContext,data: string): void {
    if (!data) return;
    if (data.includes('show')) {
      AdSdk.instance.showCustom()
    } else if (data.includes('hide')) {
      AdSdk.instance.hideCustom()
    }
  }

  onNativeShow(context: AdContext, data: string): void {
    AdSdk.instance.showNative()
  }
  onNative(context: AdContext,data: string): void {
    if (!data) return;
    if (data.includes('show')) {
      AdSdk.instance.showNative()
    }
  }

  onInterstitialShow(context: AdContext, data: string): void {
    AdSdk.instance.showInters()
  }
  onInterstitial(context: AdContext,data: string): void {
    if (!data) return;
    if (data.includes('show')) {
      AdSdk.instance.showInters()
    }
  }

  onComboShow(context: AdContext, data: AdEventHandler[]): void {
    const ads = this.adsSort(data)
    if (ads[0]) AdSdk.instance.showCustom()
        .catch(() => { if (ads[1]) return AdSdk.instance.showInters() })
        .catch(() => { if (ads[2]) return AdSdk.instance.showBanner() })
  }
  onComboHide(context: AdContext, data: AdEventHandler[]): void {
    const ads = this.adsSort(data)
    ads[0] && AdSdk.instance.hideCustom()
    ads[2] && AdSdk.instance.hideBanner()
  }
  // onCombo(context: AdContext,data: AdEventHandler[]): void {
  //   const ads = this.adsSort(data)
  //   if (ads[0]) {
  //     this.onCustom(context, ads[0].data)
  //   }
    
  // }
  private adsSort(ads: AdEventHandler[]): AdEventHandler[] {
    // 数组代表: [custom, inters, banner]
    const result: any = [false, false, false]
    for (const item of ads) {
      if(item.type === AdType.Custom) {
        result[0] = item
      } else if (item.type === AdType.Interstitial) {
        result[1] = item
      } else if (item.type === AdType.Banner) {
        result[2] = item
      }
    }
    return result
  }
}
