import { get_log, set_debug_enable } from "../../utils/Log";
import { Callback } from "../../Types";
import { ManualPromise, getItem } from "../../utils/AdUtils";
import ApiCallback from "../support/ApiCallback";
import LoginUtil from "../support/LoginUtil";


const {ccclass} = cc._decorator


const log = get_log('TTSidebar')

@ccclass
export default class TTSidebar {
  public static _store_key = 'tt_sidebar_reward_key'
  private static _instance: TTSidebar

  // 是否侧边栏启动
  private launchPromise: ManualPromise<boolean>
  // 侧边栏是否可用
  private avaliablePromise: ManualPromise<boolean>
  private hasRewarded:boolean

  static get instance(): TTSidebar {
    if (!TTSidebar._instance) {
      TTSidebar._instance = new TTSidebar
      TTSidebar._instance.init()
    }
    return TTSidebar._instance
  }
  private constructor() {
    log('创建')
    this.launchPromise = new ManualPromise<boolean>()
    this.avaliablePromise = new ManualPromise<boolean>()
  }

  private init(): void {
    log('初始化')
    // 注册 tt.onShow生命周期
    if (globalThis.tt_onShow) {
      globalThis.tt_onShow.then(res => this.onShowed(res))
    } else {
      this.launchPromise.resolve(CC_DEBUG)
    }
    this.hasRewarded = getItem(TTSidebar._store_key, false)
    if (this.hasRewarded) {
      // 已获得入口奖励，禁用侧边栏
      this.avaliablePromise.resolve(false)
      return
    }
    // 检查是否支付侧边栏功能
    if (globalThis.tt && globalThis.tt.checkScene) {
      globalThis.tt.checkScene({scene: 'sidebar', success: res => {
        log('checkScene', res)
        this.avaliablePromise.resolve(res.isExist ? res.isExist : true)
      }, fail: () => this.avaliablePromise.resolve(false)})
    } else {
      this.avaliablePromise.resolve(CC_DEBUG)
    }
  }

  private onShowed(res): void {
    if (globalThis.tt.getLaunchOptionsSync) {
      res = globalThis.tt.getLaunchOptionsSync();
    }
    if (!!res.query && !!res.query.debug) {
      set_debug_enable(true)
    }
    log("启动参数：", res.query);
    log("来源信息：", res.refererInfo);
    log("场景值：", res.scene);
    log("启动场景字段：", res.launch_from, res.location);
    // 点击模拟器的侧边栏进入小游戏时，会触发tt.onShow事件，事件的回调参数中，scene值为021036，launch_from为homepage，location为sidebar_card
    if (res.scene === '021036' && res.launch_from === 'homepage' && res.location === 'sidebar_card') {
      log('侧边栏启动')
      // 侧边栏启动
      this.launchPromise.resolve(true)
    } else {
      this.launchPromise.resolve(false)
    }
    ApiCallback.init(res.query)
    LoginUtil.login(res)
  }

  public onLaunched(callback: Callback): void {
    this.launchPromise.promise.then(res => callback(res))
  }

  public onAvaliable(callback: Callback): void {
    this.avaliablePromise.promise.then(res => callback(res))
  }

}

// module.exports = TTSidebar
