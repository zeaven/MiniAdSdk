import { IAdConfig } from "../Types"

interface AdStrategyData {
    //原生banner展示间隔(单位: 秒)
    readonly nativeBannerGap: number
    //原生banner展示次数
    readonly nativeBannerMaxCount: number
    //原生banner冷启动(单位:秒)
    readonly nativeBannerStart: number
    //原生插屏展示间隔(单位: 秒)
    readonly nativeInterstitialGap: number
    //原生插屏展示次数
    readonly nativeInterstitialMaxCount: number
    //原生插屏冷启动(单位:秒)
    readonly nativeInterstitialStart: number
    //banner展示位置（1：底部，0顶部）
    readonly bannerGravity : number
    //原生banner展示位置（1：底部，0顶部）
    readonly nativeBannerGravity: number
    //原生关闭按钮缩放比例,默认宽高为50x50,如需更改,需要按照比例去设定,例如要设定为100x100,则设定为2即可
    readonly nativeCloseButtonScale: number
    //审核是否需要原生按钮透明(0关闭 1开启)
    readonly willShowNativeDownloadTransparent : number
    //埋点调用插屏或者原生插屏的概率(如果为30,那么就是原生插屏有30的概率触发,70的概率触发插屏)
    readonly showNativeOrInterstitial: number
    //呼吸特效(0关，1开)
    readonly videoBreathe : number
    //是否显示视频图标(0是，1否)
    readonly videoUpload : number
    //原生冷启动(单位:秒)
    readonly nativeStart : number
    //原生展示间隔(单位: 秒)
    readonly nativeGap : number
    //原生展示次数
    readonly nativeMaxCount : number
    //激励冷启动(单位: 秒)
    readonly rewardStart : number
    //激励广告间隔(单位: 秒)
    readonly rewardGap : number
    //激励展示次数
    readonly rewardMaxCount : number
    //插屏冷启动
    readonly interstitialStart:number
    //插屏间隔时间
    readonly interstitialGap:number
    //插屏最大展示数量
    readonly interstitialMaxCount:number
    //原生banner关闭按钮误触概率
    readonly nativeBannerCloseButtonMistakePro : number 
    //原生插屏关闭按钮误触概率
    readonly nativeInterstitialCloseButtonMistakePro : number    
}

const DEFAULT_CONFIG: AdStrategyData = {
    nativeBannerGap: 0,
    nativeBannerMaxCount: 0,
    nativeBannerStart: 0,

    nativeInterstitialGap: 0,
    nativeInterstitialMaxCount: 0,
    nativeInterstitialStart: 0,

    rewardGap: 0, //激励广告间隔(单位: 秒)
    rewardMaxCount: 0, //激励展示次数
    rewardStart: 0, //激励冷启动(单位: 秒)
    videoUpload: 0, //是否显示视频图标(0是，1否)
    bannerGravity: 0, //banner展示位置（1：底部，0顶部）
    nativeBannerGravity: 0, //原生banner展示位置（1：底部，0顶部）
    nativeCloseButtonScale: 1, //原生关闭按钮缩放比例,默认宽高为50x50,如需更改,需要按照比例去设定,例如要设定为100x100,则设定为2即可
    willShowNativeDownloadTransparent: 1, //审核是否需要原生按钮透明(0关闭 1开启)
    videoBreathe: 0, //呼吸特效(0关，1开)
    interstitialMaxCount: 0, //插屏最大展示数量
    interstitialGap: 0, //插屏间隔时间
    interstitialStart: 0, //插屏冷启动

    showNativeOrInterstitial: 50, //埋点调用插屏或者原生插屏的概率(如果为30,那么就是原生插屏有30的概率触发,70的概率触发插屏)
    nativeBannerCloseButtonMistakePro: 0, //原生banner关闭按钮误触概率
    nativeInterstitialCloseButtonMistakePro: 0,
    nativeStart: 0,
    nativeGap: 0,
    nativeMaxCount: 0
}
const KEYMAP = {
    splash: 'SPLASH_ID',
    banner: 'BANNER_ID',
    reward: 'REWARD_ID',
    native: 'NATIVE_ID',
    interstitial: 'INTERS_ID',
    nativeInterstitial: 'NATIVE_INTERSTITIAL_ID',
    nativeBanner: 'NATIVE_BANNER_ID',
    nativeIcon: 'NATIVE_ICON_ID',
    portal: 'PORTAL_ID',
    box: 'BOX_ID',
    boxBanner: 'BOX_BANNER_ID',
    boxPortal: 'BOX_PORTAL_ID',
    boxDrawer: 'BOX_DRAWER_ID',
}
export default class RemoteAdConfigData implements AdStrategyData {
   
    private config: AdStrategyData
    private adConfig: IAdConfig
    constructor (data?: any, adConfig?: IAdConfig) {
        // 遍历 data.data.config，将其赋值给 this.config
        // 过滤掉 data.data.config 中的 null 和 undefined
        const config = data?.data?.config ?? {}
        const valueFormData = Object.entries(config)
            .filter(([key, value]) => value !== null && value !== undefined)
            .reduce((obj, [key, value]) => {
                if (key in DEFAULT_CONFIG) {
                    obj[key] = value
                }
                return obj
            }, {} as Record<string, any>)
        this.config = {...DEFAULT_CONFIG, ...valueFormData}

        const adData = data?.addata
        this.adConfig = {... adConfig}

        if (adConfig) {
            for (const key in adData) {
                const configKey = KEYMAP[key]
                if (configKey && configKey in this.adConfig) {
                    this.adConfig[configKey] = adData[key] || this.adConfig[configKey]
                }
            }
        }
    }
   
    /**
     * 返回广告位配置
     * 如 {BANNER_ID: [], INTERS_ID: []}
     */
    getAdConfig(): IAdConfig {
        return this.adConfig
    }
    /**
     * 原生展示间隔(单位: 秒)
     */ 
    get nativeGap (): number {
        return this.config.nativeGap * 1000
    }
    get nativeBannerGap (): number {
        return this.config.nativeGap * 1000
    }
    /**
     * 原生展示次数
     */
    get nativeMaxCount (): number {
        return this.config.nativeMaxCount
    }
    get buttonOpacity(): number {
        return this.config.willShowNativeDownloadTransparent
    }
    get nativeBannerMaxCount (): number {
        return this.config.nativeMaxCount
    }
    get nativeBannerStart (): number {
        return this.config.nativeStart * 1000
    }
    /**
     * 原生banner展示间隔(单位: 秒)
     */
    get nativeBannerCloseButtonMistakePro (): number {
        return this.config.nativeBannerCloseButtonMistakePro
    }

    /**
     * 原生冷启动(单位:秒)
     */
    get nativeStart (): number {
        return this.config.nativeStart * 1000
    }
    /**
     * 激励冷启动(单位: 秒)
     */
    get rewardGap (): number {
        return this.config.rewardGap * 1000
    }
    /**
     * 激励展示次数
     */
    get rewardMaxCount (): number {
        return this.config.rewardMaxCount
    }
    /**
     * 激励冷启动(单位: 秒)
     */
    get rewardStart (): number {
        return this.config.rewardStart * 1000
    }
    /**
     * 是否显示视频图标(0是，1否)
     */
    get videoUpload (): number {
        return this.config.videoUpload
    }
    /**
     * banner展示位置（1：底部，0顶部）
     */
    get bannerGravity (): number {
        return this.config.bannerGravity
    }
    /**
     * 原生banner展示位置（1：底部，0顶部）
     */
    get nativeBannerGravity (): number {
        return this.config.nativeBannerGravity
    }

    /**
     * 审核是否需要原生按钮透明(0关闭 1开启)
     */
    get willShowNativeDownloadTransparent (): number {
        return this.config.willShowNativeDownloadTransparent
    }
    /**
     * 呼吸特效(0关，1开)
     */
    get videoBreathe (): number {
        return this.config.videoBreathe
    }
    /**
     * 插屏最大展示数量
     */
    get interstitialMaxCount (): number {
        return this.config.interstitialMaxCount
    }
    /**
     * 插屏间隔时间
     */
    get interstitialGap (): number {
        return this.config.interstitialGap * 1000
    }
    /**
     * 插屏冷启动
     */
    get interstitialStart (): number {
        return this.config.interstitialStart * 1000
    }
    /**
     * 原生关闭按钮缩放比例,默认宽高为50x50,如需更改,需要按照比例去设定,例如要设定为100x100,则设定为2即可
     */
    get nativeCloseButtonScale (): number {
        return this.config.nativeCloseButtonScale
    }

    /**
     * 原生插屏关闭按钮误触概率
     */
    get nativeInterstitialCloseButtonMistakePro (): number {
        return this.config.nativeInterstitialCloseButtonMistakePro
    }
    /**
     * 原生插屏展示间隔(单位: 秒)
     */
    get nativeInterstitialGap (): number {
        return this.config.nativeInterstitialGap * 1000
    }
    /**
     * 原生插屏展示次数
     */
    get nativeInterstitialMaxCount (): number {
        return this.config.nativeInterstitialMaxCount
    }
    /**
     * 原生插屏冷启动(单位:秒)
     */
    get nativeInterstitialStart (): number {
        return this.config.nativeInterstitialStart * 1000
    }
    /**
     * 埋点调用插屏或者原生插屏的概率(如果为30,那么就是原生插屏有30的概率触发,70的概率触发插屏)
     */
    get showNativeOrInterstitial (): number {
        return this.config.showNativeOrInterstitial
    }
}