
/**
 * 插屏广告频控
对于插屏广告的展示，有一定的频率控制，具体如下：

1. 小游戏启动后的前30s（秒），不能展示插屏广告。

2. 已经展示一次插屏广告后，第二次展示需要距离上一次展示60s。

3. 展示过一次激励视频广告后，后续需要展示插屏广告的情况下，需要与激励视频广告的展示间隔60s。
 */

import { AdInterceptor, AdInvokeResult, AdInvokeNext, AdParam } from "../Types"

/**
 * 抖音拦截器
 * 处理插屏限制逻辑
 */
export class TTInterceptor implements AdInterceptor {
    private startTime: number
    private rule1: boolean = true
    private lastShowAt: number = 0
    public attach() {
      this.startTime = Date.now()
    }
  
    showInters (next: AdInvokeNext, param: AdParam): Promise<AdInvokeResult>| void {
      if (this.rule1) {
        this.rule1 = (Date.now() - this.startTime) < 30000
        if (this.rule1) return
      }
      let passTime = Date.now() - this.lastShowAt
      if (passTime < 60000) return
      
      return next(param).then(res => {
        this.lastShowAt = passTime  // 更新展示时间
        return res
      })
    }
  
    showReward (next: AdInvokeNext, param: AdParam): Promise<AdInvokeResult>| void {
      return next(param).then(res => {
        this.lastShowAt = Date.now()  // 更新展示时间
        return res
      })
    }
  }