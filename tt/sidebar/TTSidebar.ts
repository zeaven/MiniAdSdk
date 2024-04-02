import { get_log } from "../../Log";
import { Callback, Runnable } from "../../Types";
import { ManualPromise } from "../../AdUtils";


const save = (key: string, val: any): void => {
  val = JSON.stringify(val)
  cc.sys.localStorage.setItem(key, val);  
}

const load = (key: string, defaultVal: any): any => {
  let val = cc.sys.localStorage.getItem(key)
  if (val === null) {
    return defaultVal
  }
  return JSON.parse(val)
}

const log = get_log('TTSidebar')

export default class TTSidebar {
  private static _store_key = 'tt_sidebar_reward_key'
  private static _instance: TTSidebar

  // 是否侧边栏启动
  private launchPromise: ManualPromise<boolean>
  // 侧边栏是否可用
  private avaliablePromise: ManualPromise<boolean>
  rewardCallback: Runnable[];

  static get instance(): TTSidebar {
    if (!TTSidebar._instance) {
      TTSidebar._instance = new TTSidebar
      TTSidebar._instance.init()
    }
    return TTSidebar._instance
  }
  private constructor() {
    this.launchPromise = new ManualPromise<boolean>()
    this.avaliablePromise = new ManualPromise<boolean>()
    this.rewardCallback = []
  }

  private init(): void {
    if (!globalThis.tt) return
    log('初始化')
    // 注册 tt.onShow生命周期
    if (globalThis.tt_onShow) {
      globalThis.tt_onShow.then(res => this.onShowed(res))
    } else {
      this.launchPromise.resolve(false)
    }
    const hasRewarded: boolean = load(TTSidebar._store_key, false)
    if (hasRewarded) {
      // 已获得入口奖励，禁用侧边栏
      this.avaliablePromise.resolve(false)
      return
    }
    // 检查是否支付侧边栏功能
    if (globalThis.tt.checkScene) {
      globalThis.tt.checkScene({scene: 'sidebar', success: res => {
        log('checkScene', res)
        this.avaliablePromise.resolve(!!res.isExist)
      }, fail: err => this.avaliablePromise.resolve(false)})
    } else {
      this.avaliablePromise.resolve(false)
    }
  }

  private onShowed(res): void {
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
  }

  public onLaunched(callback: Callback): void {
    this.launchPromise.promise.then(res => callback(res))
  }

  public onAvaliable(callback: Callback): void {
    this.avaliablePromise.promise.then(res => callback(res))
  }

  public onRewarded(callback: Runnable): void {
    this.rewardCallback.push(callback)
  }

  public reward(): void {
    save(TTSidebar._store_key, true)
    for ( const item of this.rewardCallback) {
      item()
    }
  }
}
