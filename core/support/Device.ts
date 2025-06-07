import { Store } from "../utils/AdUtils";

class Device {
    private _openCount: number
    public readonly UUAID: string
    constructor() {
        this._openCount = Store.getItem('OPEN_COUNT', 0)
        this.UUAID = Store.getItem('UUAID')
        if (!this.UUAID) {
            this.UUAID = this.getDeviceIDUUID()
            Store.saveItem('UUAID', this.UUAID)
        }
    }

    public isLandscape(): boolean {
        const size = cc.view.getFrameSize();
        return size.width > size.height;
    }

    public get openCount() {
        return this._openCount
    }

    public incOpenCount() {
        this._openCount++
        Store.saveItem('OPEN_COUNT', this._openCount)
    }
    
    private getDeviceIDUUID()
    {
        let timestamp = new Date().getTime();
        let performanceNow = (typeof performance !== 'undefined' && performance.now ? performance.now() * 1000 : 0);

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ( c ) => {
            let random = Math.random() * 16;
            if (timestamp > 0) {
                random = (timestamp + random) % 16 | 0;
                timestamp = Math.floor(timestamp / 16);
            } else {
                random = (performanceNow + random) % 16 | 0;
                performanceNow = Math.floor(performanceNow / 16);
            }
            return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16);
        });
    }
    getSize(): {width: number, height: number} {
        const frameSize = cc.view.getFrameSize(); // 屏幕实际像素
        const designSize = cc.view.getDesignResolutionSize(); // 设计分辨率

        // 计算横向缩放比（像素 / 逻辑单位）
        const scaleX = frameSize.width / designSize.width;
        const scaleY = frameSize.height / designSize.height;

        // 计算屏幕宽度在逻辑坐标系下的表现宽度
        const visibleWidth = frameSize.width / Math.min(scaleX, scaleY);
        const visibleHeight = frameSize.height / Math.min(scaleX, scaleY);
        return {width: visibleWidth, height: visibleHeight}
    }

    adaptFontSize(baseFontSize: number, baseDesignWidth = 720): number {
        const { width } = this.getSize();
        return baseFontSize * (width / baseDesignWidth);
    }
}
const device = new Device()
export default device