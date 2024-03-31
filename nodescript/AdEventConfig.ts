import AdEventBus from "../AdEventBus"
import { get_log } from "../Log"
import { AdEvent, AdEventHandler, AdType } from "../Types"

const { ccclass, property } = cc._decorator

const lowercaseFirstLetter = (str: string): string => {
  if (str.length === 0) {
      return str; // 如果字符串为空，则返回原字符串
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * 添加到需要展示的节点中，当节点active为true时，触发配置的广告事件
 * 当节点active为false时，触发广告隐藏
 * 比如添加到弹出消息的节点，等待界面节点，游戏暂时节点等
 */
@ccclass
export default class AdEventConfig extends cc.Component {

  @property({type:[AdEventHandler], serializable:true, tooltip:`* 添加到需要展示的节点中
 * 当节点active为true时，触发配置的广告展示事件，当节点active为false时，触发广告隐藏事件
 * 比如添加到弹出消息的节点，等待界面节点，游戏暂停节点等
 * 你必须编写监听代码去处理事件`})
  public activeEvents: AdEventHandler[] = []

  @property({type:[AdEventHandler], serializable:true, tooltip:`* 添加到需要触发广告逻辑的节点中
 * 在界面增加一个节点，添加脚本到此节点来控制展示还是隐藏广告
 * 比如配置广告类型 Banner，广告数据 ’hide'，当节点被显示是就会触发此事件
 * 你必须编写监听代码去处理事件`})
  public triggerEvents: AdEventHandler[] = []

  @property({tooltip: '是否组合广告, 组合时可自行展示插屏成功后再展示banner'})
  public combo = false

  static log = get_log('AdEventConfig')

  protected onEnable(): void {
    let ads = this.activeEvents.filter(t => t.type !== AdType.None)
    let triggers =this.triggerEvents.filter(t => t.type !== AdType.None)
    if (this.combo) {
      AdEventBus.instance.emit(AdEvent.ComboShow, this.node, ads)
      AdEventBus.instance.emit(AdType[AdType.Combo], this.node, triggers)
      return
    }
    for (const event of ads) {
      let adEvent: string = lowercaseFirstLetter(AdType[event.type] + ':show')
      AdEventBus.instance.emit(adEvent, this.node, event.data)
      AdEventBus.instance.emit(AdType[event.type], this.node, event.data)
    }

  }

  protected onDisable(): void {
    let ads = this.activeEvents.filter(t => t.type !== AdType.None)
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
