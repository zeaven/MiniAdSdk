import AdBase from '../AdBase'
import log from "./OppoLog"

export default abstract class OppoBaseAd extends AdBase {
  // oppo 建议请求间隔2s，频繁请求将被平台拦截，影响广告填充
  protected createInterval: number = 2000
  protected log(...msg: any[]): void {
    log(...msg)
  }
}
