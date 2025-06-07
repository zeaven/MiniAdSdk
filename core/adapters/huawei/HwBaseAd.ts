
import AdBase from "../AdBase";
import log from "./HwLog"

export default abstract class HwBaseAd extends AdBase {
  protected log(...msg: any[]): void {
    log(...msg)
  }
  // protected createInterval: number = 0 // 广告失败后不需要重新加载
}
