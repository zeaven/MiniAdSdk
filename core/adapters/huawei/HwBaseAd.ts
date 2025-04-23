import { AdInvokeResult, AdParam } from "../../Types";

import AdBase from "../AdBase";
import log from "./HwLog"

export default abstract class HwBaseAd extends AdBase {
  protected log(...msg: any[]): void {
    log(...msg)
  }
}
