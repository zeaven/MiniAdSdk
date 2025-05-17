import { AdInitConfig, AdInterceptor, AdInitNext, AdEventType, AdHandler, IAdSdk } from "../Types"
import { get_log } from "../utils/Log"
import AdEventBus from "../utils/AdEventBus"
import { Api } from "../utils/Service";
import { Store } from "../utils/AdUtils";

const log = get_log('RemoteConfigInterceptor')

/**
 * 远程配置拦截器
 * 
 * 实现远程配置拦截器，模拟请求后端接口返回广告配置
 */
export class RemoteConfigInterceptor implements AdInterceptor {
    attach(sdk: IAdSdk): void {
        // 监听广告事件，上报到后端
        AdEventBus.instance.on(AdEventType.AdShowed, (ad: AdHandler) => {
            log('上报广告事件 ' + AdEventType.AdShowed, ad.name)
            // 请在 utils 目录下创建 Service.ts 文件，实现上报逻辑
            // Service.report(AdEventType.AdShowed, ad, ...otherArgs)
        });
        AdEventBus.instance.on(AdEventType.AdLoaded, (ad: AdHandler) => {
            log('上报广告事件: ' + AdEventType.AdLoaded, ad.name)
        });
    }

    async init (next: AdInitNext, param?: AdInitConfig): Promise<void> {
        log('模拟请求后端接口返回广告配置', param)
        let res
        // 判断有没有登录参数
        if (param.loginData) {
            res = await Api.login(param.loginData)
            // 缓存Api登录信息
            Store.cache('API_LOGIN_DATA', res)
            // 删除登录参数，防止参数泄露
            delete param.loginData
        }

        log('请求后端接口返回广告配置', res)
        // 保存接口返回的广告配置
        param.apiConfigData = res
        // 不同渠道添加自定义的拦截器，对接口返回的信息进行广告配置
        await next(param)
        delete param.apiConfigData
    }

}