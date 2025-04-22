import AdEventBus from "../utils/AdEventBus"
import { get_log } from "../utils/Log"
import { AdEvent, AdEventHandler, AdType } from "../Types"

const { ccclass, property } = cc._decorator

const lowercaseFirstLetter = (str: string): string => {
  if (str.length === 0) {
      return str; // 如果字符串为空，则返回原字符串
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * 处理广告跟随节点的展示和隐藏
 */
@ccclass
export default class AdEventConfig extends cc.Component {
  @property({readonly: true, multiline: true})
  get description(): string { return `* 添加到需要展示的节点中
 * 当节点active为true时，触发配置的广告展示事件，当节点active为false时，触发广告隐藏事件
 * 比如添加到弹出消息的节点，等待界面节点，游戏暂停节点等
 * 你必须编写监听代码去处理事件`
  }

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
      let adEvent: string = lowercaseFirstLetter(AdType[event.type] + ':show')
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
      let adEvent: string = lowercaseFirstLetter(AdType[event.type] + ':hide')
      AdEventBus.instance.emit(adEvent, this.node, event.data)
    } 
  }
}
