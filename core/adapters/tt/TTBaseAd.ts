import AdBase from '../AdBase'
import log from "./TTLog"

export default abstract class TTBaseAd extends AdBase {
  protected log(...msg: any[]): void {
    log(...msg)
  }

  protected onError(err): void {
    if (err && err.errCode >= 1005) {
        log(this.name + '不可用')
        return
    }
    super.onError(err)
  }

}
