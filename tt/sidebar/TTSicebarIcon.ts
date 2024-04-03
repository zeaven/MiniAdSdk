import AdEventBus from "../../AdEventBus";
import { Runnable } from "../../Types";
import TTSidebar from "./TTSidebar";
import TTSidebarUI from "./TTSidebarUI";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TTSidebarIcon extends cc.Component {
  @property(cc.Prefab)
  panel: cc.Prefab = null
  @property(cc.SpriteFrame)
  sidebarImg: cc.SpriteFrame = null
  @property(cc.SpriteFrame)
  rewardItem: cc.SpriteFrame = null
  @property()
  rewardAmount: string = 'x100'
  @property()
  anim: boolean = false

  private panelNode: cc.Node
  unbind: Runnable

  protected onLoad(): void {
    this.node.active = CC_DEBUG
    TTSidebar.instance.onAvaliable(res => this.node.active = res)

    this.unbind = AdEventBus.instance.on('TTSidebar:close', (reward) => {
      const nodeScript = this.panelNode.getComponent(TTSidebarUI)
      nodeScript.close(() => {
        if(reward) {
          this.node.destroy()
        } else {
          this.panelNode.active = false
        }
      })
    })
    this.node.on(cc.Node.EventType.TOUCH_END, this.onIconClick, this)
  }

  protected start(): void {
    cc.tween(this.node).repeatForever(cc.tween(this.node)
        .to(.5, {angle:-15})
        .to(1,{angle: 15})
        .to(.5, {angle: 0})
      )
      .start()
  }

  public onIconClick(): void {
    AdEventBus.instance.emit('TTSidebar:open')
    if (!this.panel) return
    // 打开入口奖励
    const node = this.getNode()
    if (!node.parent) {
      node.parent = cc.find('Canvas')
      node.zIndex = 200
      node.setPosition(0,0)
    }
    if (this.anim) {
      const nodeScript = node.getComponent(TTSidebarUI)
      nodeScript.open()
    }
    node.active = true
  }

  protected onDestroy(): void {
    this.node.off(cc.Node.EventType.TOUCH_END, this.onIconClick, this)
    if (this.panelNode) { 
      this.panelNode.destroy()
      this.panelNode = undefined
    }
    this.unbind && this.unbind()
  }
  private getNode(): cc.Node {
    if (this.panelNode) return this.panelNode
  
    this.panelNode = cc.instantiate(this.panel)
    const nodeScript = this.panelNode.addComponent(TTSidebarUI)
    nodeScript.setData(this.sidebarImg, this.rewardItem, this.rewardAmount)
    return this.panelNode
  }

}

