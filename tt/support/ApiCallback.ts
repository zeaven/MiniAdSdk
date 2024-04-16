import { AdHttp, getItem, saveItem } from "../../utils/AdUtils"
import { get_log } from "../../utils/Log"


const log = get_log('ApiCallback')
const ApiCallbackKey = 'tt_api_callback_clickid'

type ApiCallbackInfo = {
  clickid: string,
  activedAt: number
  updatedAt: number
}

const dayDiff = 86400000

export default class ApiCallback {
  private static instance: ApiCallback
  info: ApiCallbackInfo
  static init(query: any) {
    if (!query || !query.clickid) return
    this.instance = new ApiCallback(query.clickid)
  }

  constructor(clickid: string) {
    log('初始化')
    this.info = getItem(ApiCallbackKey, null)
    if (!this.info) {
      this.info = {
        clickid,
        activedAt: Date.now(),
        updatedAt: null
      }
    } else {
      this.info.clickid = clickid
    }
    
    this.report()
  }
  report() {
    let event_type: string
    const timestamp = Date.now()
    if (!this.info.updatedAt) {
      // 首次激活
      event_type = 'active'
    } else {
      // next day
      if (timestamp - dayDiff > this.info.updatedAt) {
        const pass = timestamp - this.info.activedAt
        const diff = Math.floor(pass / dayDiff)
        switch (diff) {
          case 2:
            event_type = 'next_day_open'
            break
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
            event_type = `retention_${diff}d`
            break
          default:
            break
        }
      }
    }

    if (event_type) {
      AdHttp.post('https://analytics.oceanengine.com/api/v2/conversion', {
        event_type, context: {
          ad: {
            callback: this.info.clickid
          }
        }, timestamp
      }).then(res => {
        if (res.code === 0) {
          this.info.updatedAt = timestamp
          saveItem(ApiCallbackKey, this.info)
        } else {
          log(res.message)
        }
      }).catch(err => {
        log(err)
      })
    }
  }
}
