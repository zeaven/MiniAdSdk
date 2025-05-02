import { AdParam, AdInvokeResult } from "../../Types";
import KsAdBase from "./KsAdBase";

export default class KsAdBanner extends KsAdBase {
    /**
     * 避免Banner广告对玩家过多的打扰，当Banner广告在用户手动关闭之后，此次小游戏启动周期内不会再展示出banner广告。
     * 当用户手动关闭banner广告后，下次小游戏启动时，会再次展示banner广告。
     */
    private userClosed: boolean = false
    get name(): string {
        return 'Banner'
    }
    protected createAd(_id: string) {
        // 快手banner广告通过show拉取，默认是ready状态
        this.ready = true
        if (!this.ad) {
          return globalThis.ks.createBannerAd({
            adUnitId: _id,
            left: 10,
            top: 76, 
            width: 320
          })
        }
        return this.ad
    }
    protected reLoad(immediately: boolean): void {
        if (this.userClosed) {
            return
        }
        super.reLoad(immediately)
    }
    show(param: AdParam): Promise<AdInvokeResult> {
        if (this.userClosed) {
            return Promise.reject('用户手动关闭了Banner广告，不再展示')
        }
        return super.show(param)
    }
    
    protected onLoad(res?: any): void {
        // 因为banner广告是通过show拉取的，所以onLoad里面重新执行onShow，保证事件顺序一致
        super.onLoad(res)
        super.onShow()
    }
    
    protected onShow(): void {
        // 取消默认的onShow事件，改为加载超时，且超时后要重新调用 show，因为banner广告是通过show拉取的
        this.setLoadTimeout(10000).then(() => {
          this.show({})
        })
    }
    close(): void {
        this.userClosed = true
        super.close()
    }
}