import { AdInterface, ILoginable } from "../Types"

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
 * 存储工具类
 */
class Store {
  private static _cache: Record<string, any> = {}
  /**
   * 缓存数据，退出游戏后会清除
   * @example
   * Store.cache('key') // 读取 key 值
   * Store.cache('key', 'val') // 写入 key 值
   * Store.cache({key1: 'value1', key2: 'value2'}) // 批量写入 key 值
   * @param key 缓存键
   * @param defaultVal 默认值
   */
  static cache(key: string| Record<string, any>, val?: any): any {
    if (typeof key === 'object') {
      for (const k in key) {
        Store._cache[k] = key[k]
      }
    } else if (!!val) {
      Store._cache[key] = val
    } else {
      return Store._cache[key]
    }
  }
  /**
   * 保存数据，退出游戏后不会清除
   * @param key 缓存键
   * @param val 缓存值
   * @param expire 过期时间，单位ms，0为永不过期，-1为不缓存
   */
  static saveItem(key: string, val: any, expire: number = 0): void {
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
  /**
   *  获取数据
   * @param key 缓存键
   * @param defaultVal  默认值
   * @param remove  是否移除缓存
   * @returns 
   */
  static getItem(key: string, defaultVal?: any, remove: boolean = false): any {
    let expire = cc.sys.localStorage.getItem(key + '_expire')
    if (expire && Date.now() > parseInt(expire)) {
      Store.removeItem(key)
      return defaultVal
    } else if (expire === null) {
      return defaultVal
    }
    let val = cc.sys.localStorage.getItem(key)
    if (!val) {
      return defaultVal
    }
    if (remove) {
      Store.removeItem(key)
    }
    if (val.startsWith('{') && val.endsWith('}')) {
      return JSON.parse(val)
    }
    return val
  }
  /**
   * 移除数据
   * @param key 缓存键
   */
  static removeItem (key: string): void {
    cc.sys.localStorage.removeItem(key)
    cc.sys.localStorage.removeItem(key + '_expire')
  }
}

/**
 * http请求工具类
 */
class AdHttp {
  private static request(url: string, method: string, data?: any, headers?: Record<string, any>): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const param = !!data ? JSON.stringify(data): null
      xhr.open(method.toUpperCase(), url, true)
      xhr.setRequestHeader('Content-Type', 'application/json')
      if (headers) {
        for (const key in headers) {
          xhr.setRequestHeader(key, headers[key])
        }
      }
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

  /**
   * http get请求
   * @param url 请求地址
   * @param data 请求参数
   * @param headers 请求头
   * @returns
   */
  static async get<T = string>(url: string, data?: any, headers?: Record<string, any>): Promise<T> {
    if (typeof data === 'object') {
      url += url.includes('?') ? '&' : '?'
      for (const key of data) {
        let val = decodeURI(data[key])
        url += `${key}=${val}&`
      }
      url = url.slice(0, -1)

      const text = await AdHttp.request(url, 'GET', null, headers)
      return (!!text && text.startsWith('{')) ? JSON.parse(text): (text as T)
    }
  }
  /**
   * http post请求
   * @param url 请求地址
   * @param data 请求参数
   * @param headers 请求头
   * @returns
   */
  static async post<T = string>(url: string, data?: any, headers?: Record<string, any>): Promise<T> {
    const text = await AdHttp.request(url, 'POST', data, headers)
    return (!!text && text.startsWith('{')) ? JSON.parse(text): (text as T)
  }
}

export { ManualPromise, Store, AdHttp }
