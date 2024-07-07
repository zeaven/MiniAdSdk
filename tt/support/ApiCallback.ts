import { AdHttp, getItem, saveItem } from "../../utils/AdUtils"
import { get_log } from "../../utils/Log"
import { getPlatform } from "../../utils/AdPlatform"


const log = get_log('ApiCallback')
const ApiCallbackKey = 'tt_api_callback_clickid'
const ApiCallbackURL = 'https://analytics.oceanengine.com/api/v2/conversion';

type ApiCallbackInfo = {
  clickid: string,
  activedAt: number
  updatedAt: number
}

const dayDiff = 86400000

export default class ApiCallback {
  private static instance: ApiCallback
  info: ApiCallbackInfo
  platform: string
  static init(query: any) {
    log('ApiCallback启动参数', query)
    this.instance = new ApiCallback(query.clickid)
  }

  constructor(clickid: string) {
    log('ApiCallback初始化:' + clickid)
    this.platform = getPlatform()
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
    
    this.reportDay()
  }
  reportDay() {
    if (!this.info.clickid) return
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
      AdHttp.post(ApiCallbackURL, {
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
  /**
   * 上报关键行为
   */
  report(event_type = 'game_addiction', properties = {}) {
    if (!this.info.clickid) return
    const timestamp = Date.now()
    AdHttp.post(ApiCallbackURL, {
      event_type, context: { 
        ad: { callback: this.info.clickid },
        device: { platform: this.platform },
        properties
      }, timestamp
    }).then(res => {
        if (res.code === 0) {
          log('回传成功')
        } else {
          log(res.message)
        }
      }).catch(err => {
        log(err)
      })
  }
}
