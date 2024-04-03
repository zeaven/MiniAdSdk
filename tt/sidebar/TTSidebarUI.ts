import AdEventBus from "../../AdEventBus";
import { Runnable } from "../../Types";
import Sidebar from "./TTSidebar";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TTSidebarUI extends cc.Component {
  unbindCallback: () => void;
  panel: cc.Node;
  sidebarImg: cc.SpriteFrame;
  rewardItem: cc.SpriteFrame;
  rewardAmount: string;
 

  protected onLoad(): void {
    const btnReward = cc.find('panel/btnReward', this.node)
    const btnEntry = cc.find('panel/btnEntry', this.node)
    const btnClose = cc.find('panel/btnClose', this.node)
    this.panel = cc.find('panel', this.node)
    this.init()

    Sidebar.instance.onLaunched(res => {
      btnReward.active = res
      btnEntry.active = !res
    })

    btnClose.on(cc.Node.EventType.TOUCH_END, this.onBtnCloseClick, this)
    btnReward.on(cc.Node.EventType.TOUCH_END, this.onBtnRewardClick, this)
    btnEntry.on(cc.Node.EventType.TOUCH_END, this.onBtnEntryClick, this)
    this.unbindCallback = () => {
      btnClose.off(cc.Node.EventType.TOUCH_END, this.onBtnCloseClick, this)
      btnReward.off(cc.Node.EventType.TOUCH_END, this.onBtnRewardClick, this)
      btnEntry.off(cc.Node.EventType.TOUCH_END, this.onBtnEntryClick, this)
    }
  }

  public setData(sidebarImg: cc.SpriteFrame, rewardItem: cc.SpriteFrame, rewardAmount: string): void {
    this.sidebarImg= sidebarImg
    this.rewardItem= rewardItem
    this.rewardAmount= rewardAmount
  }

  private init(): void {
    const imgNode = cc.find('content/sidebarImg', this.panel)
    const itemNode = cc.find('content/rewardItem', this.panel)
    const amountNode = cc.find('content/rewardAmount', this.panel)
    let sprite: cc.Sprite
    if (imgNode) {
      sprite = imgNode.getComponent(cc.Sprite)
      sprite.spriteFrame = this.sidebarImg
    }
    if (itemNode) {
      sprite = itemNode.getComponent(cc.Sprite)
      sprite.spriteFrame = this.rewardItem
    }
    if (amountNode) {
      const label = amountNode.getComponent(cc.Label)
      label.string = this.rewardAmount
    }
  }

  public onBtnEntryClick(event: cc.Event): void {
    globalThis.tt && globalThis.tt.navigateToScene({
      scene: 'sidebar'
    })
    this.onBtnCloseClick(event)
  }

  public onBtnRewardClick(event: cc.Event): void {
    // 完成奖励逻辑
    AdEventBus.instance.emit('TTSidebar:reward') // 这个方法会通知入口奖励按钮进行隐藏
    this.onBtnCloseClick(event, true)
  }

  public onBtnCloseClick(event: cc.Event, hasRewarded?: any): void {
    // 完成关闭弹框操作
    AdEventBus.instance.emit('TTSidebar:close', hasRewarded) 
  }

  protected onDestroy(): void {
    this.unbindCallback && this.unbindCallback()
    this.unbindCallback = undefined
  }

  /**
   * open
   */
  public open(): void {
    this.panel.scale = .15
    cc.tween(this.panel)
      .to(.1, { scale: 1.1})
      .to(.25, { scale: 1})
      .start()
  }
  public close(cb: Runnable): void {
    cc.tween(this.panel)
      .to(.1, { scale: 1.1})
      .to(.2, { scale: .15})
      .call(cb)
      .start()
  }
}
