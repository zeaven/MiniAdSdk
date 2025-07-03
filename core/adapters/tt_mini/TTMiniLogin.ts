import device from "../../support/Device";
import { AdInitConfig, ApiLoginData, LoginCode, LoginResult } from "../../Types";
import { curPlatform } from "../../utils/AdPlatform";
import { Store } from "../../utils/AdUtils";

interface SuccessResult {
    code: string;
}
interface ErrorResult {
    error: {
        error_code: number;
        error_msg: string;
        error_extra: Record<string, unknown>;
    }
}

export default class TTMiniLogin {
    public static login(config: AdInitConfig): Promise<LoginResult> {
        const loginResult: ApiLoginData = {
            code: '',
            scene: '',
            clickid: '',
            playerId: '',
            oaid: '',
            localId: '',
            ot: ''+device.openCount,
            appVersion: config.adConfig.APP_VERSION,
            brand: '',
            packageName: config.adConfig.PACKAGE_NAME,
            appId: config.adConfig.APP_ID,
            sdkVersion: config.sdkVersion,
            platform: curPlatform,
            openId: '',
        }
        // 如何已经授权并记录 open_id，直接返回
        // 后端要适配open_id参数，并在传递code时需要返回 open_id
        const serverLoginResult = Store.getItem(Store.KEY.API_LOGIN_RESULT)
        if (serverLoginResult && serverLoginResult.open_id) {
            // 已缓存服务端上次返回数据，直接使用
            loginResult.openId = serverLoginResult.open_id
            return Promise.resolve({data: loginResult,code: LoginCode.SUCCESS})
        }
        return new Promise((resolve, reject) => {
            globalThis.TTMinis.game.login({
                success: (res: SuccessResult) => {
                    // 请求后端获取 open_id，或直接传递code，让后端返回 open_id
                    loginResult.code = res.code
                    resolve({data: loginResult,code: LoginCode.SUCCESS})
                },
                fail: (err: ErrorResult) => {
                    reject({data: err.error.error_msg, code: LoginCode.FAILED})
                }
            })
        })
    }
}