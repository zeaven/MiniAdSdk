import Sidebar from "./TTSidebar";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TTSidebarUI extends cc.Component {
  @property(cc.Node)
  btnEntry: cc.Node
  @property(cc.Node)
  btnReward: cc.Node

  protected onLoad(): void {
    Sidebar.instance.onLaunched(res => {
      this.btnReward.active = res
      this.btnEntry.active = !res
    })
  }

  public onBtnEntryClick(): void {
    // 完成奖励逻辑

    Sidebar.instance.reward() // 这个方法会通知入口奖励按钮进行隐藏
    this.onBtnCloseClick()
  }

  public onBtnRewardClick(): void {
    globalThis.tt && globalThis.tt.navigateToScene({
      scene: 'sidebar'
    })
    this.onBtnCloseClick()
  }

  public onBtnCloseClick(): void {
    // 完成关闭弹框操作
    
  }

 
}
