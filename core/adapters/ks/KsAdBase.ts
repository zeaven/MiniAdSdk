import AdBase from "../AdBase";
import log from "./KsLog"

export default abstract class KsAdBase extends AdBase {
  protected log(...msg: any[]): void {
    log(...msg)
  }
  

}
