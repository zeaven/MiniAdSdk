/**
 * 广告事件总线
 */
export default class AdEventBus {
  private static _instance: AdEventBus
  private eventTarget: cc.EventTarget

  static get instance(): AdEventBus {
    if (AdEventBus._instance === null) {
      AdEventBus._instance = new AdEventBus()
    }
    return AdEventBus._instance
  }

  constructor() {
    this.eventTarget = new cc.EventTarget()
  }

  public emit(event: string, ...args: any[]): void {
    cc.log(event, ...args)
    this.eventTarget.emit(event, ...args)
  }

  public on(event: string, callback: any, target?: any) : void {
    this.eventTarget.on(event, callback, target)
  }
}
