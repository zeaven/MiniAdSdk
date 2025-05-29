import { AdType } from "../../Types";
import AdBase from "../AdBase";
import log from "./BoxLog"

export default abstract class BoxBaseAd extends AdBase {
  protected log(...msg: any[]): void {
    log(...msg)
  }
}
