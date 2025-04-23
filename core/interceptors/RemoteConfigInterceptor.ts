import { AdInitConfig, AdInterceptor, AdInitNext, AdEventType } from "../Types";
import { get_log } from "../utils/Log";
import AdConfig from "../AdConfig";
import AdEventBus from "../utils/AdEventBus";

const log = get_log('RemoteConfigInterceptor')

/**
 * 远程配置拦截器
 * 
 * 实现远程配置拦截器，模拟请求后端接口返回广告配置
 */
export class RemoteConfigInterceptor implements AdInterceptor {
    attach(): void {
        log('attach')
        // 监听广告事件，上报到后端
        AdEventBus.instance.on(AdEventType.AdShowed, (ad) => {
            log('上报广告事件 ' + AdEventType.AdShowed, ad)
            // 请在 utils 目录下创建 Service.ts 文件，实现上报逻辑
            // Service.report(AdEventType.AdShowed, ad, ...otherArgs)
        });
        AdEventBus.instance.on(AdEventType.AdLoaded, (ad) => {
            log('上报广告事件: ' + AdEventType.AdLoaded, ad)
        });
    }

    init (next: AdInitNext, param?: AdInitConfig): Promise<void> {
        log('模拟请求后端接口返回广告配置')

        return new Promise((resolve) => {
            // 模拟1秒后结束，实现请求后端接口返回广告配置
            setTimeout(() => {
                param = param ?? {}
                // 根据后端返回的配置，设置广告配置，假设是华为广告
                param.adConfig = new AdConfig.HuaweiConfig()
                param.adConfig.BANNER_ID = ['123456']
                next(param)
                log('调用 init 结束')
                resolve()
            }, 1000)
        })
    }

}