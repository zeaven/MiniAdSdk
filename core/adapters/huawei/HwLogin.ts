import device from "../../support/Device";
import { AdInitConfig, LoginCode, LoginResult } from "../../Types";
import { curPlatform } from "../../utils/AdPlatform";
import { Store } from "../../utils/AdUtils";

export default class HwLogin {
    static async login(config: AdInitConfig) : Promise<LoginResult> {
        // 存储启动参数
        const launchOptions = globalThis.qg.getLaunchOptionsSync()
        Store.cache(Store.KEY.LAUNCH_OPTIONS, launchOptions)
        // 并发执行获取启动参数和OAID
        const [oaid, systemInfo] = await Promise.all([
            HwLogin.getOAID(),
            HwLogin.getSystemInfo(),
        ])

        return new Promise((resolve, reject) => {
            console.log('HwLogin login', JSON.stringify(config))
            if (config.debug) {
                return resolve({data: {
                    code: '',
                    scene: '',
                    clickid: HwLogin.getClickid(launchOptions),
                    playerId: '',
                    oaid: oaid,
                    localId: '',
                    ot: ''+device.openCount,
                    appVersion: config.adConfig.APP_VERSION,
                    brand: systemInfo.brand,
                    packageName: config.adConfig.PACKAGE_NAME,
                    appId: config.adConfig.APP_ID,
                    sdkVersion: config.sdkVersion,
                    platform: curPlatform
                }, code: LoginCode.SUCCESS})
            }
            qg.gameLoginWithReal({
                forceLogin:1,
                appid: config.adConfig.APP_ID,
                success:function(data){ 
                    // 登录成功后，可以存储账号信息。   
                    Store.cache(Store.KEY.PLATFORM_LOGIN_RESULT, data)
                    // 构建 Api 登录参数, 具体参数请自行获取
                    resolve({data: {
                        code: '',
                        scene: '',
                        clickid: '',
                        playerId: data.playerId,
                        oaid: oaid,
                        localId: '',
                        ot: '',
                        appVersion: config.adConfig.APP_VERSION,
                        brand: systemInfo.brand,
                        packageName: config.adConfig.PACKAGE_NAME,
                        appId: config.adConfig.APP_ID,
                        sdkVersion: config.sdkVersion,
                        platform: curPlatform
                    },code: LoginCode.SUCCESS})
                },
                fail:function(data,code){
                    // console.log("game login with real fail:" + data + ", code:" + code);
                    //根据状态码处理游戏的逻辑。
                    //状态码为7004或者2012，表示玩家取消登录。
                    //此时，建议返回游戏界面，可以让玩家重新进行登录操作。
                    if(code ==7004||code ==2012){
                        // console.log("玩家取消登录，返回游戏界面让玩家重新登录。")
                        reject({data, code: LoginCode.CANCEL_LOGIN})
                    } else if(code ==7021){
                        //状态码为7021表示玩家取消实名认证。
                        //在中国大陆的情况下，此时需要禁止玩家进入游戏。
                        // console.log("The player has canceled identity verification. Forbid the player from entering the game.")
                        reject({data, code: LoginCode.CANCEL_REALNAME})
                    } else {
                        reject({data, code: LoginCode.FAILED})
                    }
                }
            });
        })
    }

    static getClickid(launchOptions: any): string {
        if (launchOptions && launchOptions.query) {
            let query: any = launchOptions.query
            if (query === 'string') {
                query = JSON.parse(query)
            }
            if (query.clickid) {
                return query.clickid
            }
        }
        return ''
    }

    static getOAID(): Promise<string> {
        return new Promise((resolve, reject) => {
            globalThis.qg.getOAID({
                success: function(res) {
                    // console.log("getOAID success, oaid is " + res.oaid);
                    resolve(res.oaid)
                },
                fail: function(err) {
                    resolve('')
                }
            })
        })
    }

    static getSystemInfo(): Promise<any> {
        return new Promise((resolve, reject) => {
            globalThis.qg.getSystemInfo({
                success: function(res) {
                    // console.log("getSystemInfo success, res is " + JSON.stringify(res));
                    resolve(res)
                },
                fail: function() {
                    reject()
                }
            })
        })
    }
}