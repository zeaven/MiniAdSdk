import { AdInterface, IPrivacyLogin } from "../Types"

/**
 * 手动控制Promise
 */
class ManualPromise<T> {
  private _promise: Promise<T>
  private _resolve: (value: T | PromiseLike<T>) => void
  private _reject: (reason?: any) => void
  get promise() {
    return this._promise
  }

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  public resolve(value: T | PromiseLike<T>): void {
    this._resolve(value)
  }
  public reject(reason?: string): void {
    this._reject(reason)
  }
}

/**
 * 
 * @param key 缓存键
 * @param val 缓存值
 * @param expire 过期时间，单位ms，0为永不过期，-1为不缓存
 */
const saveItem = (key: string, val: any, expire: number = 0): void => {
  if (typeof val === 'object') {
    val = JSON.stringify(val)
  }
  if (expire > 0) {
    expire = Date.now() + expire
  } else if (expire === -1) {
    return
  }
  cc.sys.localStorage.setItem(key, val);  
  cc.sys.localStorage.setItem(key + '_expire', expire.toString())
}

const getItem = (key: string, defaultVal?: any, remove: boolean = false): any => {
  let expire = cc.sys.localStorage.getItem(key + '_expire')
  if (expire && Date.now() > parseInt(expire)) {
    cc.sys.localStorage.removeItem(key)
    cc.sys.localStorage.removeItem(key + '_expire')
    return defaultVal
  } else if (expire === null) {
    return defaultVal
  }
  let val = cc.sys.localStorage.getItem(key)
  if (!val) {
    return defaultVal
  }
  if (remove) {
    cc.sys.localStorage.removeItem(key)
    cc.sys.localStorage.removeItem(key + '_expire')
  }
  if (val.startsWith('{') && val.endsWith('}')) {
    return JSON.parse(val)
  }
  return val
}
const removeItem = (key: string): void => {
  cc.sys.localStorage.removeItem(key)
  cc.sys.localStorage.removeItem(key + '_expire')
}

class AdHttp {
  static request(url: string, method: string, data?: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const param = !!data ? JSON.stringify(data): null
      xhr.open(method.toUpperCase(), url, true)
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText)
          } else {
            reject(new Error('AdHttp请求失败: ' + xhr.status))
          }
        }
      }
      xhr.onerror = function () {
        reject(new Error('AdHttp发送失败'))
      }
      xhr.send(param)
    })
  }

  static async get(url: string, data?: any): Promise<Object> {
    if (typeof data === 'object') {
      url += url.includes('?') ? '&' : '?'
      for (const key of data) {
        let val = decodeURI(data[key])
        url += `${key}=${val}&`
      }
      url = url.slice(0, -1)

      const text = await AdHttp.request(url, 'GET')
      return (!!text && text.startsWith('{')) ? JSON.parse(text): text
    }
  }

  static async post(url: string, data?: any): Promise<Object> {
    const text = await AdHttp.request(url, 'POST', data)
    return (!!text && text.startsWith('{')) ? JSON.parse(text): text
  }
}

function isIPrivacyLogin(adapter: AdInterface): adapter is AdInterface & IPrivacyLogin {
  return 'login' in adapter && typeof adapter.login === 'function';
}

export { ManualPromise, saveItem, getItem, removeItem, AdHttp, isIPrivacyLogin}
