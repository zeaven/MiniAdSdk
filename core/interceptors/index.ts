import { DelayInterceptor } from "./DelayInterceptor";
import { MutexInterceptor } from "./MutexInterceptor";
import { RemoteConfigInterceptor } from "./RemoteConfigInterceptor";
import { RetryInterceptor } from "./RetryInterceptor";
import { TTInterceptor } from "./TTInterceptor";

/**
 * 拦截器
 * @description 拦截器是在广告执行前和执行后的处理函数
 * @example
 * AdSdk.instance.addInterceptor(Platform.TT, new TTInterceptor())
 * 
 * export class TTInterceptor implements AdInterceptor {
    private startTime: number
    private rule1: boolean = true
    private lastShowAt: number = 0
    public attach() {
      this.startTime = Date.now()

      // 也可以使用事件总线监听广告事件，更新展示时间
    //   AdEventBus.instance.on(AdEventType.AdShowed, (ad) => {
    //     this.lastShowAt = passTime  // 更新展示时间
    //   });
    }
  
    showInters (next: AdInvokeNext, param: AdParam): Promise<AdInvokeResult>| void {
      if (this.rule1) { // 小游戏启动后的前30s（秒），不能展示插屏广告。
        this.rule1 = (Date.now() - this.startTime) < 30000
        if (this.rule1) return // 直接返回即取消此次调用
      }
      let passTime = Date.now() - this.lastShowAt
      // 60s内不能重复展示
      if (passTime < 60000) return
      
      // 执行下一个拦截器，如果没有拦截器，则执行原始调用方法
      return next(param).then(res => {
        // 执行成功后更新展示时间
        this.lastShowAt = passTime  // 更新展示时间
        return res
      })
    }
  }
 */

export {
    DelayInterceptor,
    MutexInterceptor,
    RetryInterceptor,
    TTInterceptor,
    RemoteConfigInterceptor,
}