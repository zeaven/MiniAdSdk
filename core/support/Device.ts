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
}
const device = new Device()
export default device