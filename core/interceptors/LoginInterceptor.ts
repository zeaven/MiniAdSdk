import { AdEventType, AdInitConfig, AdInitNext, AdInterceptor, AdInterface, IAdSdk, ILoginable, LoginCode, LoginResult } from "../Types";
import AdEventBus from "../utils/AdEventBus";
import { Store } from "../utils/AdUtils";
import { get_log } from "../utils/Log";

const log = get_log('LoginInterceptor')
/**
 * 登录拦截器
 * 在需要登录的地方调用 AdSdk.instance.init() 方法，会自动调用登录拦截器
 * 登录拦截器会模拟登录逻辑，登录成功后会调用 next(param) 方法，继续初始化广告SDK
 * 登录失败会触发登录取消事件，需要在游戏中处理登录取消事件, 比如返回游戏界面让用户重新登录
 * 注意：重新登录还是调用 AdSdk.instance.init()
 */
export class LoginInterceptor implements AdInterceptor {
    sdk: IAdSdk;
    private loginCount = 0
    attach(sdk: IAdSdk): void {
        this.sdk = sdk
    }
    async init (next: AdInitNext, param?: AdInitConfig): Promise<void> {
        if (!this.sdk.adapter) {
            log('适配器不存在')
            return next(param)
        }
        const privacyPromise = this.isPrivacyable(param) ? this.startPrivacy(param) : Promise.resolve().then(() => {
            log('不需要隐私政策')
        })
        
        await privacyPromise
        // 已经同意隐私政策，继续登录
        if (this.isLoginable(this.sdk.adapter)) {
            const adapter = this.sdk.adapter as unknown as ILoginable
            return this.startLogin(adapter, next, param)
        } else {
            log('未实现登录接口')
            return next(param)
        }
    }

    startPrivacy(config?: AdInitConfig): Promise<void> {
        if (Store.getItem('agreePrivacy')) {
            log('已经同意隐私')
            return Promise.resolve()
        } else {
            return new Promise((resolve) => {
                config.privacy({
                    agreePrivacy: () => {
                        log('同意隐私')
                        Store.saveItem('agreePrivacy', true)
                        // 监听隐私同意事件
                        AdEventBus.instance.emit(AdEventType.PrivacyAgreed)
                        resolve()
                    }
                })
            })
        }
    }

    startLogin (adapter: ILoginable, next: AdInitNext, param?: AdInitConfig): Promise<void> {
        this.loginCount++
        // 测试代码
        // if (this.loginCount < 3) {
        //     log('测试登录重试次数', this.loginCount)
        //     return Promise.reject('登录失败')
        // }
        log('开启登录')
        // 开启登录
        return adapter.login().then((res: LoginResult) => {
            log('平台登录成功', res)
            AdEventBus.instance.emit(AdEventType.LoginSuccess, res.data);
            // 登录成功后继续初始化广告SDK
            // 将登录信息添加到初始化参数中，或者utils增加一个登录信息缓存对象，供其他地方使用
            param = param || {}
            param.loginData = res.data
            return next(param)
        }).catch((err: LoginResult) => {
            log('登录失败', err)
            // 登录失败会触发登录取消事件，需要在游戏中处理登录取消事件, 比如返回游戏界面让用户重新登录
            if (err.code === LoginCode.CANCEL_LOGIN) {
                // 返回游戏界面让用户重新登录
                AdEventBus.instance.emit(AdEventType.LoginCancelLogin, err);
            } else if (err.code === LoginCode.CANCEL_REALNAME) {
                // 返回游戏界面让用户重新实名
                AdEventBus.instance.emit(AdEventType.LoginCancelRealname, err);
            } else {
                // 其他错误
                AdEventBus.instance.emit(AdEventType.LoginFailed, err);
            }
            return Promise.reject('登录失败')
        })
    }

    isLoginable (adapter: AdInterface): boolean {
        return 'login' in adapter && typeof adapter.login === 'function'
    }

    isPrivacyable (config: AdInitConfig): boolean {
        return 'privacy' in config && typeof config.privacy === 'function'
    }
}