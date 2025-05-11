import { EventCallback, Runnable } from "../Types"


/**
 * 广告事件总线
 * example:
 *  AdEventBus.instance.on(AdEventType.AdLoaded, (ad: AdBase, ...otherArgs) => {
 *    // do something
 *  })
 *  AdEventBus.instance.emit(AdEventType.AdLoaded, ad, ...otherArgs);
 */
export default class AdEventBus {
  private static _instance: AdEventBus
  private events: Map<string, Array<{callback: EventCallback, target?: any}>> = new Map()

  static get instance(): AdEventBus {
    if (!AdEventBus._instance) {
      AdEventBus._instance = new AdEventBus()
    }
    return AdEventBus._instance
  }

  constructor() {
    // 不再需要 cc.EventTarget
  }

  public emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event)
    if (listeners) {
      listeners.forEach(({callback, target}) => {
        if (target) {
          callback.apply(target, args)
        } else {
          callback(...args)
        }
      })
    }
  }

  public on(event: string, callback: EventCallback, target?: any): Runnable {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    
    const listeners = this.events.get(event)!
    const listener = {callback, target}
    listeners.push(listener)

    // 返回取消监听的函数
    return () => {
      const idx = listeners.indexOf(listener)
      if (idx !== -1) {
        listeners.splice(idx, 1)
      }
      if (listeners.length === 0) {
        this.events.delete(event)
      }
    }
  }
}
