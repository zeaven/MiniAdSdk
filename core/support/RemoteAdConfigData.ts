interface AdConfigData {
    //banner展示位置（1：底部，0顶部）
    readonly bannerGravity : number
    //原生banner展示位置（1：底部，0顶部）
    readonly nativeBannerGravity: number
    //原生关闭按钮设置宽度（单位：px）
    readonly nativeCloseButtonWidth : number
    //原生关闭按钮高度（单位：px）
    readonly nativeCloseButtonHeight : number
    //审核是否需要原生按钮透明(0关闭 1开启)
    readonly willShowNativeDownloadTransparent : number
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
}

const defaultConfig: AdConfigData = {
    nativeGap: 0,   
    nativeMaxCount: 0,  
    nativeStart: 0,  
    rewardGap: 0, 
    rewardMaxCount: 0,
    rewardStart: 0,   
    videoUpload: 0,
    bannerGravity : 0,
    nativeBannerGravity: 0,
    nativeCloseButtonWidth : 66,   
    nativeCloseButtonHeight : 66,     
    willShowNativeDownloadTransparent : 0, 
    videoBreathe : 0,   
    interstitialMaxCount : 0,
    interstitialGap : 0,
    interstitialStart : 0
}

export default class RemoteAdConfigData implements AdConfigData {
    private config: AdConfigData
    constructor (data?: any) {
        const valueFormData = Object.entries(data)
            .filter(([key, value]) => value !== null && value !== undefined)
           .reduce((obj, [key, value]) => {
               obj[key] = value
               return obj
           }, {} as Record<string, any>)
        this.config = {...defaultConfig, ...valueFormData}
    }
    /**
     * 原生展示间隔(单位: 秒)
     */ 
    get nativeGap (): number {
        return this.config.nativeGap
    }
    /**
     * 原生展示次数
     */
    get nativeMaxCount (): number {
        return this.config.nativeMaxCount
    }
    /**
     * 原生冷启动(单位:秒)
     */
    get nativeStart (): number {
        return this.config.nativeStart
    }
    /**
     * 激励冷启动(单位: 秒)
     */
    get rewardGap (): number {
        return this.config.rewardGap
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
        return this.config.rewardStart
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
     * 原生关闭按钮设置宽度（单位：px）
     */
    get nativeCloseButtonWidth (): number {
        return this.config.nativeCloseButtonWidth
    }
    /**
     * 原生关闭按钮高度（单位：px）
     */
    get nativeCloseButtonHeight (): number {
        return this.config.nativeCloseButtonHeight
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
        return this.config.interstitialGap
    }
    /**
     * 插屏冷启动
     */
    get interstitialStart (): number {
        return this.config.interstitialStart
    }

}