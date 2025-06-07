import AdStrategyGroup from "../strategies/AdStrategyGroup";
import { NativeAdView } from "../support/NativeAdLayout";
import RemoteAdConfigData from "../support/RemoteAdConfigData";
import { AdEventType, AdHandler, AdInitConfig, AdInitNext, AdInterceptor, AdInvokeNext, AdInvokeResult, AdInvokeResultVoid, AdParam, AdType, ApiReportData, IAdSdk, IAdStrategy } from "../Types";
import { get_log } from "../utils/Log";
import { Api } from "../utils/Service";

const log = get_log('AdStrategyInterceptor')
/**
 * 广告策略拦截器
 */
export class AdStrategyInterceptor implements AdInterceptor {
    sdk: IAdSdk
    remoteAdConfigData: RemoteAdConfigData
    showCountMap = {}
    reportDataDefault: ApiReportData
    strategyGroup: AdStrategyGroup

    attach(sdk: IAdSdk): void {
        this.sdk = sdk

        // 监听广告事件，上报到后端
        sdk.on(AdEventType.AdShowed, (ad: AdHandler, options: any) => {
            log('上报广告事件: ' + AdEventType.AdShowed, ad.name)
        
            // NOTICE: 以下为测试代码
            const reportData: ApiReportData = {...this.reportDataDefault,
                event: AdEventType.AdShowed,
                adType: this.getAdType(ad),
                adID: ad.name,
                msg: '广告展示成功',
                ...options,
            }
            Api.reportAd(reportData)
            
        });
        sdk.on(AdEventType.AdLoaded, (ad: AdHandler) => {
            log('上报广告事件: ' + AdEventType.AdLoaded, ad.name)
        });
        sdk.on(AdEventType.AdClicked, (ad: AdHandler) => {
            log('上报广告事件: ' + AdEventType.AdClicked, ad.name)
        });
    }
    async init(next: AdInitNext, param?: AdInitConfig): Promise<void> {
        // 这里还不能展示广告，因为广告适配器还没有执行init方法，广告类型也没初始化
        if (param?.remoteAdConfigData) {
            this.remoteAdConfigData = param.remoteAdConfigData
            delete param.remoteAdConfigData
        } else {
            this.remoteAdConfigData = new RemoteAdConfigData(null, param.adConfig)
        }
        // 合并后端返回的广告位配置信息
        param.adConfig = this.remoteAdConfigData.getAdConfig()
        // 将后台配置的策略数据转换为策略组
        this.strategyGroup = new AdStrategyGroup(this.remoteAdConfigData)
        if (this.strategyGroup.strategies[AdType.Banner]) {
            // 传入 bannerGravity 给适配器，让banner支持自定义位置
            param.bannerGravity = (this.strategyGroup.strategies[AdType.Banner] as IAdStrategy).gravity
        }
        
        this.reportDataDefault = {
            platform: param.loginData?.platform,
            packageName: param.loginData?.packageName,
            sdkVersion: param.loginData?.sdkVersion,
            appVersion: param.loginData?.appVersion,
            oaid: param.loginData?.oaid,
            appid: param.loginData?.appId,
            playerId: param.loginData?.playerId,
            localId: param.loginData?.localId,
            adID: '',
            event: '',
            adType: '',
            msg: '',
        }

        await next(param)

        /******* 初始化完成后，执行策略 ********/
        log('初始化完成后，执行策略')
        for (const [type, adStrategy] of Object.entries(this.strategyGroup.strategies)) {
            if (adStrategy.autoStartTime) {
                // 使用策略标识 'strategy' 作为触发源
                this.delayRepeatShow(() => this.sdk.show(adStrategy.adType, {source: 'strategy'}), type, adStrategy.autoStartTime, adStrategy.autoInterval, adStrategy.autoRepeatTimes)
            }
        }

    }

    /**
     * 
     * @param cb 展示回调
     * @param type 广告类型
     * @param delay 展示延时时间
     * @param interval 展示间隔时间
     * @param repeat 重复次数
     */
    delayRepeatShow(cb: Function, type: string, delay: number, interval: number, repeat: number) {
        if (!(type in this.showCountMap)) {
            this.showCountMap[type] = 0
        }
        // 激励视频关闭后，再次展示
        setTimeout(() => {
            // 自动展示激励视频
            cb().then((res) => {
                if (repeat) {
                    // 更新展示次数
                    this.showCountMap[type]++
                    if (this.showCountMap[type] >= repeat) {
                        // 达到展示次数，不再展示
                        return
                    }
                    // 关闭后重新执行
                    res.onClose = () => repeat && this.delayRepeatShow(cb, type, interval, interval, repeat)
                }
            }).catch(() => this.delayRepeatShow(cb, type, interval, interval, repeat)) // 展示失败重新执行
        }, delay)
    }


    private getAdType(ad: AdHandler): string {
        for (const key in AdType) {
            if (ad.constructor.name.includes(key)) {
                return AdType[key]
            }
        }
        return AdType[0]
    }

    /**
     * 广告策略展示概率逻辑
     * @param type 广告类型
     * @param param 广告参数
     * @returns 
     */
    private invokeRate(type: AdType, param: AdParam): any {
        // 屏蔽 strategy:rate和 strategy:error 等触发源，避免无限循环
        if (param?.source?.startsWith('strategy:')) {
            // 已经是概率触发，不再重复执行概率逻辑
            return
        }
        const strategy: IAdStrategy = this.strategyGroup.strategies[type]
        if (strategy?.showRate) {
            let rate = Math.random() * 100
            for (const rateType in strategy.showRate) {
                if (rate <= strategy.showRate[rateType]) {
                    param = {...param, source:'strategy:rate'}
                    return this.sdk.show(AdType[rateType], param)
                }
                rate -= strategy.showRate[type]
            }
        }
    }

    /********** 以下为策略测试逻辑 **********/
    showBanner (next: AdInvokeNext, param?: AdParam): Promise<AdInvokeResultVoid> | void {
        return this.invokeRate(AdType.Banner, param) ?? next(param)
    }
    /**
     * 拦截插屏展示
     * 如果展示插屏失败，自动展示原生
     * @param next 
     * @param param 
     */
    showInters (next: AdInvokeNext, param?: AdParam): Promise<AdInvokeResultVoid> | void {
        return this.invokeRate(AdType.Interstitial, param) ?? next(param)
            .catch((err) => {
                if (param?.source === 'strategy:error') {
                    // 已经自动触发，不再自动触发，否则无限循环
                    throw err
                }
                // 增加 source 标识自动触发
                param = {...param, type: AdType.NativeInterstitial, source: 'strategy:error' }
                // 插屏展示失败，自动展示原生
                return this.sdk.showNative(param)
            })
    }
    /**
     * 拦截原生展示
     * 如果展示原生插屏失败，自动展示插屏
     * @param next 
     * @param param 
     * @returns 
     */
    showNative (next: AdInvokeNext, param?: AdParam): Promise<AdInvokeResultVoid> | void {
        let type = AdType.Native
        if (param?.type === AdType.NativeInterstitial) {
            type = AdType.NativeInterstitial
        } else if (param?.type === AdType.NativeBanner) {
            type = AdType.NativeBanner
        } else if (param?.type === AdType.NativeIcon) {
            type = AdType.NativeIcon
        }
        return this.invokeRate(type, param) ?? next(param)
            .then((res) => {
                const strategy: IAdStrategy = this.strategyGroup.strategies[type]
                if (strategy && res && res.getNativeAdView) {
                    const adView: NativeAdView = res.getNativeAdView()
                    if (type === AdType.NativeInterstitial || param?.type === AdType.Native) {
                        // 控制广告样式
                        if (strategy.closeBtnIncorrectClickRate) {
                            adView.setCloseBtnIncorrectClickRate?.(strategy.closeBtnIncorrectClickRate)
                        }
                        if (strategy.closeBtnAlpha) {
                            adView.setCloseBtnAlpha?.(strategy.closeBtnAlpha)
                        }
                        if (strategy.closeBtnScale) {
                            adView.setCloseBtnScale?.(strategy.closeBtnScale)
                        }
                        adView.setNativeDownloadBtnTransparent?.(strategy.nativeDownloadBtnTransparent)
                    }
                }
                
                return res
            })
            .catch((err) => {
                if (param.type !== AdType.NativeInterstitial || param?.source === 'strategy:error') {
                    // 已经自动触发，不再自动触发，否则无限循环
                    throw err
                }
                // 增加 source 标识自动触发
                param = {...param, source: 'strategy:error' }
                // 原生展示失败，自动展示插屏
                return this.sdk.showInters(param)
            })  
    }

    /**
     * 拦截激励视频展示
     * 展示完成后展示插屏
     * @param next 
     * @param param 
     * @returns 
     */
    showReward (next: AdInvokeNext, param?: AdParam): Promise<AdInvokeResultVoid> | void {
        return this.invokeRate(AdType.Reward, param) ?? next(param).then((res) => {
            if (res && res.rewardPromise) {
                // 未看完激励视频才展示
                res.rewardPromise.catch((err) => {
                    if (Math.random() < 0.3) {
                        // 30%概率展示插屏
                        param = {...param, source:'strategy:reward-error' }
                        this.sdk.showInters(param)
                    }
                    throw err
                })
            }
            
            return res
        })
    }
    /************** 策略测试结束 ************/
}