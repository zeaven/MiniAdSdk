import HwBaseAd from "./HwBaseAd";

export default class HwIntersAd extends HwBaseAd {
  get name(): string { return '插屏' }

  protected createAd(_id: string): any {
    return qg.createInterstitialAd({
      adUnitId: _id,
    })
  }
}
