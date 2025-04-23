import AdBase from "../AdBase";
import log from "./AliLog"

export default abstract class AliBaseAd extends AdBase {
  protected log(...msg: any[]): void {
    log(...msg)
  }
}