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

const saveItem = (key: string, val: any): void => {
  val = JSON.stringify(val)
  cc.sys.localStorage.setItem(key, val);  
}

const getItem = (key: string, defaultVal: any): any => {
  let val = cc.sys.localStorage.getItem(key)
  if (!val) {
    return defaultVal
  }
  return JSON.parse(val)
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

export { ManualPromise, saveItem, getItem, AdHttp}
