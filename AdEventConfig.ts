import AdEventBus from "./AdEventBus"
import { get_log } from "./Log"
import { AdEvent, AdEventHandler, AdType } from "./Types"

const { ccclass, property } = cc._decorator

/**
 * 添加到需要展示的节点中，当节点active为true时，触发配置的广告事件
 * 当节点active为false时，触发广告隐藏
 * 比如添加到弹出消息的节点，等待界面节点，游戏暂时节点等
 */
@ccclass
export default class AdEventConfig extends cc.Component {
  // @property({tooltip: '广告触发数据，如: 1、2等,在展示广告时判断展示样式'})
  // public bannerConfig = ''
  // @property({tooltip: '广告触发数据'})
  // public interstitialConfig = ''
  // @property({tooltip: '广告数据'})
  // public customConfig = ''
  @property({type:[AdEventHandler], serializable:true, tooltip:'广告配置列表'})
  public ads: AdEventHandler[] = []
  @property({tooltip: '是否组合广告, 组合时可自行展示插屏成功后再展示banner'})
  public combo = false

  static log = get_log('AdEventConfig')

  protected onEnable(): void {
    let ads = this.ads.filter(t => t.type !== AdType.None)
    if (this.combo) {
      AdEventBus.instance.emit(AdEvent.ComboShow, this.node, ads)
      return
    }
    for (const event of ads) {
      let adEvent: string = AdType[event.type] + ':show'
      AdEventBus.instance.emit(adEvent, this.node, event.data)
    }

  }

  protected onDisable(): void {
    let ads = this.ads.filter(t => t.type !== AdType.None)
    if (this.combo) {
      AdEventBus.instance.emit(AdEvent.ComboHide, this.node, ads)
      return
    }
    for (const event of ads) {
      let adEvent: string = AdType[event.type] + ':hide'
      AdEventBus.instance.emit(adEvent, this.node, event.data)
    } 
  }
}
