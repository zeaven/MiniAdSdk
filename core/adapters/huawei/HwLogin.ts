import { AdInitConfig, LoginCode, LoginResult } from "../../Types";

export default class HwLogin {
    static login(config: AdInitConfig) : Promise<LoginResult> {
        return new Promise((resolve, reject) => {
            console.log('HwLogin login', JSON.stringify(config))
            if (config.debug) {
                resolve({data: {}, code: LoginCode.SUCCESS})
                return
            }
            qg.gameLoginWithReal({
                forceLogin:1,
                appid: config.adConfig.APP_ID,
                success:function(data){ 
                    // 登录成功后，可以存储账号信息。             
                    resolve({data,code: LoginCode.SUCCESS})
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
}