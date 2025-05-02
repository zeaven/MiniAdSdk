import { Runnable } from "../../Types";
import OppoBaseAd from "./OppoBaseAd";

export default class OppoBoxDrawerAd extends OppoBaseAd  {
    get name(): string {
        return '盒子抽屉广告'
    }
    protected getAdListeners(): Record<string, Runnable> {
        const listeners = super.getAdListeners()
        // 盒子抽屉广告没有onLoad事件，但是有onShow事件
        listeners['onShow'] = this.onLoad.bind(this)
        return listeners
    }
    protected createAd(_id: string): any {
        return globalThis.qg.createGameDrawerAd({
            adUnitId: _id,
            style: {
                top: 0,
            }
        })
    }
    protected onLoad(res?: any): void {
        // 先触发父类的onLoad事件，保证事件顺序一致
        super.onLoad(res)
        super.onShow()
    }

    protected onShow(): void {
        // 盒子抽屉广告有onShow事件，不需要手动触发
    }
}