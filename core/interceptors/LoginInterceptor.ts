import { AdEventType, AdInitConfig, AdInitNext, AdInterceptor, AdInterface, IAdSdk, IPrivacyLogin, LoginCode, LoginResult } from "../Types";
import AdEventBus from "../utils/AdEventBus";
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
    attach(sdk: IAdSdk): void {
        this.sdk = sdk
    }
    init (next: AdInitNext, param?: AdInitConfig): Promise<void>  {
        // 是否实现了登录接口
        if (this.sdk.adapter && this.isIPrivacyLogin(this.sdk.adapter)) {
            const adapter = this.sdk.adapter as unknown as IPrivacyLogin
            log('开启登录')
            // 开启登录
            return adapter.login().then(res => {
                log('登录成功', res)
                AdEventBus.instance.emit(AdEventType.LoginSuccess, res.data);
                // 登录成功后继续初始化广告SDK
                // 将登录信息添加到初始化参数中
                param = param || {}
                param.loginInfo = res.data
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
        } else {
            log('未实现登录接口')
            return next(param)
        }
    }

    private isIPrivacyLogin(adapter: AdInterface): adapter is AdInterface & IPrivacyLogin {
        return 'login' in adapter && typeof adapter.login === 'function';
    }
      
}