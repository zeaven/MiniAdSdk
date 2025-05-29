import { AdType, Runnable } from "../../Types";
import OppoBaseAd from "./OppoBaseAd";

export default class OppoBoxDrawerAd extends OppoBaseAd  {
    protected type: AdType = AdType.Box
    protected createAd(_id: string): any {
        return globalThis.qg.createGameDrawerAd({
            adUnitId: _id,
            style: {
                top: 0,
            }
        })
    }

    protected onShow(): void {
        // 盒子抽屉广告没有onLoad事件，但是有onShow事件
        super.onLoad(null)
        super.onShow()
    }
}