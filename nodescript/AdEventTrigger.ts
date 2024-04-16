import AdEventBus from "../utils/AdEventBus"
import { get_log } from "../utils/Log"
import { AdEventHandler, AdType } from "../Types"

const { ccclass, property } = cc._decorator

/**
 * 在节点展示时处理广告逻辑
 */
@ccclass
export default class AdEventTrigger extends cc.Component {
  @property({readonly: true,multiline: true})
  get description(): string { return `* 添加到需要触发广告逻辑的节点中
 * 在界面增加一个节点，添加脚本到此节点来控制展示还是隐藏广告
 * 比如配置广告类型 Banner，广告数据 ’hide'，当节点被显示是就会触发此事件
 * 你必须编写监听代码去处理事件`
  }

  @property({type:[AdEventHandler], serializable:true, tooltip:'广告配置列表'})
  public ads: AdEventHandler[] = []
  // @property({tooltip: '是否组合广告, 组合时可自行展示插屏成功后再展示banner'})
  // public combo = false

  static log = get_log('AdEventConfig')


  protected onEnable(): void {
    let ads = this.ads.filter(t => t.type !== AdType.None)
    // if (this.combo) {
    //   AdEventBus.instance.emit(AdType[AdType.Combo], this.node, ads)
    //   return
    // }
    for (const event of ads) {
      AdEventBus.instance.emit(AdType[event.type], this.node, event.data)
    }

  }

}
