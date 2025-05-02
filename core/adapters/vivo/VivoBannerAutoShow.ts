import VivoBannerAd from "./VivoBannerAd";

export class VivoBannerAutoShow extends VivoBannerAd {
    // 关闭10秒后重新展示
    createInterval = 10000

    protected onLoad(res?: any): void {
        super.onLoad(res)
        this.show({})
    }

}