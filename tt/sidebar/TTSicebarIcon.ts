import AdEventBus from "../../AdEventBus";
import TTSidebar from "./TTSidebar";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TTSidebarIcon extends cc.Component {
  @property(cc.Node)
  icon: cc.Node
  @property(cc.Prefab)
  panel: cc.Prefab

  protected onLoad(): void {
    this.icon.active = CC_DEBUG
    TTSidebar.instance.onAvaliable(res => this.icon.active = res)
    AdEventBus.instance.on('TTSidebar:reward', () => this.icon.active = false)
  }

  public onIconClick(): void {
    // 打开入口奖励
    AdEventBus.instance.emit('TTSidebar:open', this.panel)
  }
}
