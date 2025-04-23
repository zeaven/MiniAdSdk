import { AdEventType, AdHandler, AdInvokeResult, AdParam } from '../../Types'
import AdEventBus from '../../utils/AdEventBus'
import AdBase from '../AdBase'
import log from "./VivoLog"

export default abstract class VivoBaseAd extends AdBase {
  protected log(...msg: any[]): void {
    log(...msg)
  }
}
