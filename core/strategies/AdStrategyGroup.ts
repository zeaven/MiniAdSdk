import RemoteAdConfigData from "../support/RemoteAdConfigData";
import { AdType, IAdStrategy, IAdStrategyGroup } from "../Types";

/**
 * 广告策略组
 * 
 * 广告策略组是广告策略的集合，用于管理多个广告策略，每个广告策略对应一个广告类型，
 * 广告策略组可以根据广告类型来获取对应的广告策略。
 */
export default class AdStrategyGroup implements IAdStrategyGroup{
    private _name: string
    private _strategies: Partial<Record<keyof typeof AdType, IAdStrategy>>
    private _adFlagEnable: boolean
    constructor(adConfig: RemoteAdConfigData, name?: string) {
        this._name = name ?? 'default'
        this._adFlagEnable = !!adConfig.videoUpload   
        this._strategies = {}

        let adStrategy: IAdStrategy = {adType: AdType.Banner}
        adStrategy.autoStartTime = (adConfig.nativeBannerStart || adConfig.nativeBannerGap) * 1000
        adStrategy.autoInterval = adConfig.nativeBannerGap * 1000
        adStrategy.autoRepeatTimes = adConfig.nativeBannerMaxCount
        adStrategy.gravity = adConfig.nativeBannerGravity === 1 ? 'bottom' : 'top'
        adStrategy.closeBtnScale = adConfig.nativeCloseButtonScale
        adStrategy.closeBtnIncorrectClickRate = adConfig.nativeBannerCloseButtonMistakePro
        adStrategy.showRate = { NativeBanner: 100 } // 只使用native banner
        this._strategies.Banner = adStrategy
        
        adStrategy = {adType: AdType.Interstitial}
        adStrategy.autoStartTime = (adConfig.interstitialStart || adConfig.interstitialGap) * 1000
        adStrategy.autoInterval = adConfig.interstitialGap * 1000
        adStrategy.autoRepeatTimes = adConfig.interstitialMaxCount
        if (adConfig.showNativeOrInterstitial) {
            const rate = adConfig.showNativeOrInterstitial
            adStrategy.showRate = { NativeInterstitial: rate, Interstitial: (100 - rate) }
        }
        this._strategies.Interstitial = adStrategy
        
        adStrategy = {adType: AdType.NativeInterstitial}
        adStrategy.autoStartTime = (adConfig.nativeInterstitialStart || adConfig.nativeInterstitialGap) * 1000
        adStrategy.autoInterval = adConfig.nativeInterstitialGap * 1000
        adStrategy.autoRepeatTimes = adConfig.nativeInterstitialMaxCount
        adStrategy.nativeDownloadBtnTransparent = !!adConfig.willShowNativeDownloadTransparent
        adStrategy.closeBtnScale = adConfig.nativeCloseButtonScale
        adStrategy.closeBtnIncorrectClickRate = adConfig.nativeInterstitialCloseButtonMistakePro
        this._strategies.NativeInterstitial = adStrategy
        
        adStrategy = {adType: AdType.Native}
        adStrategy.autoStartTime = (adConfig.nativeStart || adConfig.nativeGap) * 1000
        adStrategy.autoInterval = adConfig.nativeGap * 1000
        adStrategy.autoRepeatTimes = adConfig.nativeMaxCount
        adStrategy.nativeDownloadBtnTransparent = !!adConfig.willShowNativeDownloadTransparent
        adStrategy.closeBtnScale = adConfig.nativeCloseButtonScale
        adStrategy.closeBtnIncorrectClickRate = adConfig.nativeInterstitialCloseButtonMistakePro
        this._strategies.Native = adStrategy

        if (adConfig.rewardStart || adConfig.rewardGap) {
            adStrategy = {adType: AdType.Reward}
            adStrategy.autoStartTime = (adConfig.rewardStart ?? adConfig.rewardGap) * 1000
            adStrategy.autoInterval = adConfig.rewardGap * 1000
            adStrategy.autoRepeatTimes = adConfig.rewardMaxCount
            this._strategies.Reward = adStrategy
        }
    }
    get name(): string {
        return this._name
    }
    get strategies(): Partial<Record<keyof typeof AdType, IAdStrategy>> {
        return this._strategies
    }
    get adFlagEnable(): boolean {
        return this._adFlagEnable
    }
}