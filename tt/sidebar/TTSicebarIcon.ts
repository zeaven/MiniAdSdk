import AdEventBus from "../../AdEventBus";
import { Runnable } from "../../Types";
import TTSidebar from "./TTSidebar";
import TTSidebarUI from "./TTSidebarUI";

const {ccclass, property} = cc._decorator;

const save = (key: string, val: any): void => {
  val = JSON.stringify(val)
  cc.sys.localStorage.setItem(key, val);  
}


@ccclass
export default class TTSidebarIcon extends cc.Component {
  @property({type: cc.Prefab, tooltip: '入口奖励预制节点'})
  panel: cc.Prefab = null
  @property({tooltip: '游戏名称'})
  gameName: string = null
  @property({type: cc.SpriteFrame, tooltip: '侧边栏游戏图标'})
  sidebarImg: cc.SpriteFrame = null
  @property({type: cc.SpriteFrame, tooltip: '奖励物品图标'})
  rewardItem: cc.SpriteFrame = null
  @property({tooltip: '奖励数量'})
  rewardAmount: number = 100
  @property()
  anim: boolean = false
  @property({type: cc.Component.EventHandler,tooltip: '奖励回调'})
  rewardEvent: cc.Component.EventHandler = null
  @property({type: cc.Component.EventHandler,tooltip: '打开回调'})
  openEvent: cc.Component.EventHandler = null
  @property({type: cc.Component.EventHandler,tooltip: '关闭回调'})
  closeEvent: cc.Component.EventHandler = null

  private panelNode: cc.Node
  unbinds: Runnable[] = []
  hasRewarded: boolean;

  protected onLoad(): void {
    this.node.active = CC_DEBUG
    TTSidebar.instance.onAvaliable(res => this.node.active = res)

    let cb = AdEventBus.instance.on('TTSidebar:close', (reward) => {
      const nodeScript = this.panelNode.getComponent(TTSidebarUI)
      nodeScript.close(() => {
        if(reward) {
          this.node.destroy()
        } else {
          this.panelNode.active = false
        }
      })
    })
    this.unbinds.push(cb)
    cb = AdEventBus.instance.on('TTSidebar:reward', this.onRewarded, this)
    this.unbinds.push(cb)
    cb = AdEventBus.instance.on('TTSidebar:close', this.onClosed, this)
    this.unbinds.push(cb)
    this.node.on(cc.Node.EventType.TOUCH_END, this.onIconClick, this)
    cb = () => this.node.off(cc.Node.EventType.TOUCH_END, this.onIconClick, this)
    this.unbinds.push(cb)
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
    this.openEvent && this.openEvent.emit([])
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
    nodeScript.setData(this.gameName, this.sidebarImg, this.rewardItem, this.rewardAmount)
    return this.panelNode
  }

  private onRewarded(): void {
    if (this.hasRewarded) return
    this.hasRewarded = true
    save(TTSidebar._store_key, true)
    this.rewardEvent && this.rewardEvent.emit([this.rewardAmount])
    this.unbind()
  }

  private onClosed(): void {
    this.closeEvent && this.closeEvent.emit([])
  }

  private unbind(): void {
    for (const cb of this.unbinds) {
      cb()
    }
  }

}

