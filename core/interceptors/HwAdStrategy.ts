import { AdEventType, AdInitConfig, AdInitNext, AdInterceptor, AdParam, IAdSdk } from "../Types";

/**
 * 华为广告策略拦截器
 */
export class HwAdStrategy implements AdInterceptor {
    attach(sdk: IAdSdk): void {
        sdk.on(AdEventType.SdkInited, () => {
            // 初始化完成后展示 banner
            sdk.showBanner()
            // 其他自动展示逻辑在此处完整
            
        })
    }
    async init(next: AdInitNext, param?: AdInitConfig): Promise<void> {
        // 这里还不能展示广告，因为广告适配器还没有执行init方法，广告类型也没初始化
        // 自行实现，策略数据如 HuaWeiAdData，通过param传递给适配器

        return next(param)
    }
}