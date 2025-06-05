import RemoteAdConfigData from "../support/RemoteAdConfigData";
import { AdEventType, AdHandler, AdInitConfig, AdInitNext, AdInterceptor, AdInvokeNext, AdInvokeResult, AdInvokeResultVoid, AdParam, AdType, ApiReportData, IAdSdk } from "../Types";
import { get_log } from "../utils/Log";
import { Api } from "../utils/Service";

const log = get_log('AdStrategyInterceptor')
/**
 * 广告策略拦截器
 */
export class AdStrategyInterceptor implements AdInterceptor {
    sdk: IAdSdk
    remoteAdConfigData: RemoteAdConfigData
    showCountMap = {'reward': 0, 'inters': 0, 'native': 0}
    reportDataDefault: ApiReportData;

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
        // 自行实现，策略数据如 HuaWeiAdData，通过param传递给适配器
        this.remoteAdConfigData = (param.remoteAdConfigData ?? new RemoteAdConfigData()) as RemoteAdConfigData
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
        // 自动展示 banner
        this.sdk.showBanner()

        /******* 激励视频 ************/
        if (this.remoteAdConfigData.rewardGap) {
            this.delayRepeatShow(() => this.sdk.showReward(), 'reward', this.remoteAdConfigData.rewardGap, this.remoteAdConfigData.rewardMaxCount)
        }
        if (this.remoteAdConfigData.rewardStart) {
            this.delayRepeatShow(() => this.sdk.showReward(), 'reward', this.remoteAdConfigData.rewardStart)
        }

        /******* 插屏 ************/
        if (this.remoteAdConfigData.interstitialGap) {
            this.delayRepeatShow(() => this.sdk.showInters(), 'inters', this.remoteAdConfigData.interstitialGap, this.remoteAdConfigData.interstitialMaxCount)
        }
        if (this.remoteAdConfigData.interstitialStart) {
            this.delayRepeatShow(() => this.sdk.showInters(), 'inters', this.remoteAdConfigData.interstitialStart)
        }

        /******* 原生 ************/
        if (this.remoteAdConfigData.nativeGap) {
            this.delayRepeatShow(() => this.sdk.showNative(), 'native', this.remoteAdConfigData.nativeGap, this.remoteAdConfigData.nativeMaxCount)
        }
        if (this.remoteAdConfigData.nativeStart) {
            this.delayRepeatShow(() => this.sdk.showNative(), 'native', this.remoteAdConfigData.nativeStart)
        }
    }

    /**
     * 
     * @param cb 展示回调
     * @param type 广告类型
     * @param interval 展示延时时间
     * @param repeat 重复次数，为0时，失败后不会再展示，默认是1
     */
    delayRepeatShow(cb: Function, type: string, interval: number, repeat: number = 1) {
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
                    res.onClose = () => repeat && this.delayRepeatShow(cb, type, interval, repeat)
                }
            }).catch(() => repeat && this.delayRepeatShow(cb, type, interval, repeat)) // 展示失败重新执行
        }, interval * 1000)
    }


    private getAdType(ad: AdHandler): string {
        for (const key in AdType) {
            if (ad.constructor.name.includes(key)) {
                return AdType[key]
            }
        }
        return AdType[0]
    }
    /********** 以下为策略测试逻辑 **********/
    /**
     * 拦截插屏展示
     * 如果展示插屏失败，自动展示原生
     * @param next 
     * @param param 
     */
    showInters (next: AdInvokeNext, param?: AdParam): Promise<AdInvokeResultVoid> | void {
        return next(param).catch((err) => {
            if (param?.auto) {
                // 已经自动触发，不再自动触发，否则无限循环
                throw err
            }
            // 增加 auto 标识自动触发
            param = {...param, auto: true }
            // 插屏展示失败，自动展示原生
            return this.sdk.showNative(param)
        })
    }
    /**
     * 拦截原生展示
     * 如果展示原生失败，自动展示插屏
     * @param next 
     * @param param 
     * @returns 
     */
    showNative (next: AdInvokeNext, param?: AdParam): Promise<AdInvokeResultVoid> | void {
        return next(param).catch((err) => {
            if (param?.auto) {
                // 已经自动触发，不再自动触发，否则无限循环
                throw err
            }
            // 增加 auto 标识自动触发
            param = {...param, auto: true }
            // 原生展示失败，自动展示插屏
            return this.sdk.showInters(param)
        })  
    }

    /**
     * 拦截激励视频展示
     * 展示完成后随机展示插屏或原生
     * @param next 
     * @param param 
     * @returns 
     */
    showReward (next: AdInvokeNext, param?: AdParam): Promise<AdInvokeResultVoid> | void {
        return next(param).then((res) => {
            if (res && res.rewardPromise) {
                // 未看完激励视频才展示
                res.rewardPromise.catch((err) => {
                    if (Math.random() < 0.3) {
                        // 30%概率展示插屏
                        // 随机展示插屏或原生
                        if (Math.random() > 0.5) {
                            this.sdk.showInters({auto: true})
                        } else {
                            this.sdk.showNative({auto: true})
                        }
                    }
                    throw err
                })
            }
            
            return res
        })
    }
    /************** 策略测试结束 ************/
}