import AdBase from '../AdBase'
import log from "./VivoLog"

export default abstract class VivoBaseAd extends AdBase {
  protected log(...msg: any[]): void {
    log(...msg)
  }
  protected createInterval: number = 3000
}
