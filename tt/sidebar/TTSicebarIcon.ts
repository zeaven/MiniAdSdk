import Sidebar from "./TTSidebar";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TTSidebarIcon extends cc.Component {
  @property(cc.Node)
  icon: cc.Node
  protected onLoad(): void {
    this.icon.active = CC_DEBUG
    this.icon && Sidebar.instance.onAvaliable(res => this.icon.active = res)
    this.icon && Sidebar.instance.onRewarded(() => this.icon.active = false)
  }

}
