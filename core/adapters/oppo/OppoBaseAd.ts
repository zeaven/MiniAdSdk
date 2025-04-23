import AdBase from '../AdBase'
import log from "./OppoLog"

export default abstract class OppoBaseAd extends AdBase {
  protected log(...msg: any[]): void {
    log(...msg)
  }
}
