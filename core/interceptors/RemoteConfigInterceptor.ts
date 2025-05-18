import { AdInitConfig, AdInterceptor, AdInitNext, AdEventType, AdHandler, IAdSdk } from "../Types"
import { get_log } from "../utils/Log"
import { Api } from "../utils/Service";
import { Store } from "../utils/AdUtils";
import device from "../support/Device";
import RemoteAdConfigData from "../support/RemoteAdConfigData";

const log = get_log('RemoteConfigInterceptor')

/**
 * 远程配置拦截器
 * 
 * 实现远程配置拦截器，模拟请求后端接口返回广告配置
 */
export class RemoteConfigInterceptor implements AdInterceptor {
    attach(sdk: IAdSdk): void {

    }

    async init (next: AdInitNext, param?: AdInitConfig): Promise<void> {
        log('模拟请求后端接口返回广告配置', param)
        let res
        // 判断有没有登录参数
        if (param.loginData) {
            res = await Api.login(param.loginData)
            // 更新打开次数
            device.incOpenCount()
            // 缓存Api登录信息
            Store.cache(Store.KEY.API_LOGIN_RESULT, res)
            // 删除登录参数，防止参数泄露
            delete param.loginData
        }

        log('请求后端接口返回广告配置', res)
        // 解析后台配置
        const remoteAdConfigData = new RemoteAdConfigData(res)
        // 通过参数传递给下一个拦截器
        param.remoteAdConfigData = remoteAdConfigData
        // 不同渠道添加自定义的拦截器，对接口返回的信息进行广告配置，如AdStrategyInterceptor
        await next(param)
        delete param.remoteAdConfigData
    }

}