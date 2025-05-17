import { AdHttpContext } from "../Types"

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
 * cache是临时缓存，退出游戏后会清除
 * saveItem是永久缓存，退出游戏后不会清除
 */
class Store {
  /**
   * 缓存键，可自行定义其他键
   */
  static KEY = {
    LAUNCH_OPTIONS: 'LAUNCH_OPTIONS',
    PLATFORM_LOGIN_RESULT: 'PLATFORM_LOGIN_RESULT',
    API_LOGIN_RESULT: 'API_LOGIN_RESULT',
  } as const
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
      this.cache(key, val)
      return
    }
    cc.sys.localStorage.setItem(key, val);  
    cc.sys.localStorage.setItem(key + '_expire', expire)
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
    if (expire && parseInt(expire) > 0 && Date.now() > parseInt(expire)) {
      Store.removeItem(key)
      return defaultVal
    } else if (expire === null) {
      return this.cache(key) || defaultVal
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
  private baseUrl: string
  private requestInterceptors: Array<(ctx: AdHttpContext) => AdHttpContext> = []
  private responseInterceptors: Array<(response: string) => any> = []
  private errorInterceptors: Array<(error: Error) => any> = []
  
  constructor(baseUrl: string) {
    // 添加baseUrl末尾的/
    this.baseUrl = baseUrl.endsWith('/')? baseUrl: baseUrl + '/'
    // 默认 json 拦截器
    this.addResponseInterceptor((response) => {
      if (!!response && response.startsWith('{') && response.endsWith('}')) {
        return JSON.parse(response)
      }
      return response
    })
  }

  /**
   * 添加请求拦截器
   * @param interceptor 拦截器函数
   */
  addRequestInterceptor(interceptor: (ctx: AdHttpContext) => AdHttpContext) {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * 添加响应拦截器
   * @param interceptor 拦截器函数
   */
  addResponseInterceptor(interceptor: (response: string) => any) {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * 添加错误拦截器
   * @param interceptor 拦截器函数
   */
  addErrorInterceptor(interceptor: (error: Error) => any) {
    this.errorInterceptors.push(interceptor)
  }

  private request<T>(url: string, method: string, data?: any, headers?: Record<string, any>): Promise<T> {
    // 默认headers
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    let cancelSignal = false
    // 执行请求拦截器
    let config: AdHttpContext = { 
      url, 
      method: method.toLowerCase(), 
      data, 
      headers: {...defaultHeaders, ...headers},
      cancel: () => {
        cancelSignal = true
      }
    }
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config) || config
      if (cancelSignal) {
        return Promise.reject()
      }
    }

    // 拼接url
    if (!config.url.startsWith('http')) {
      config.url = this.baseUrl + (config.url.startsWith('/') ? config.url.slice(1): config.url)
    }
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const param = !!config.data ? JSON.stringify(config.data): null
      xhr.open(config.method, config.url, true)
      if (config.headers) {
        for (const key in config.headers) {
          xhr.setRequestHeader(key, config.headers[key])
        }
      }
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            let response = xhr.responseText
            // 执行响应拦截器
            try {
              for (const interceptor of this.responseInterceptors) {
                response = interceptor(response) || response
              }
              resolve(response as T)
            } catch (error) {
              // 执行错误拦截器
              let err = error
              for (const interceptor of this.errorInterceptors) {
                err = interceptor(err) || err
              }
              reject(err)
            }
          } else {
            let error = new Error('AdHttp请求失败: ' + xhr.status)
            // 执行错误拦截器
            for (const interceptor of this.errorInterceptors) {
              error = interceptor(error) || error
            }
            reject(error)
          }
        }
      }
      xhr.onerror = () => {
        let error = new Error('AdHttp发送失败')
        // 执行错误拦截器
        for (const interceptor of this.errorInterceptors) {
          error = interceptor(error) || error
        }
        reject(error)
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
  get<T = string>(url: string, data?: any, headers?: Record<string, any>): Promise<T> {
    if (typeof data === 'object') {
      url += url.includes('?') ? '&' : '?'
      for (const key of data) {
        let val = decodeURI(data[key])
        url += `${key}=${val}&`
      }
      url = url.slice(0, -1)

      return this.request(url, 'GET', null, headers)
    }
  }
  /**
   * http post请求
   * @param url 请求地址
   * @param data 请求参数
   * @param headers 请求头
   * @returns
   */
  post<T = string>(url: string, data?: any, headers?: Record<string, any>): Promise<T> {
    return this.request(url, 'POST', data, headers)
  }
}

/**
 * 延时调用，首次触发，在指定时间后仅执行一次
 * @param func 延时方法
 * @param wait 延时时间(ms)
 * @returns 
 */
function delay(func: Function, wait: number): any {
    let inThrottle: boolean = false;

    return function(...args: any[]): any {
        if (!inThrottle) {
            inThrottle = true;
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(func(...args))
                inThrottle = false
              }, wait)
            })
        }
    };
}

/**
 * 防抖方法，在指定时间内只触发最后一次调用
 * @param func 需要防抖的方法
 * @param wait 等待时间(ms)
 * @returns 
 */
function debounce(func: Function, wait: number): any {
  let timeout: any = null;
  
  return function(...args: any[]): any {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(func(...args));
      }, wait);
    });
  };
}

/**
 * 防并发方法，在一次调用完成前忽略其他调用
 * @param func 需要防并发的方法
 * @returns 
 */
function mutex(func: Function): any {
  let isRunning = false;
  
  return async function(...args: any[]): Promise<any> {
    if (isRunning) {
      return;
    }
    
    try {
      isRunning = true;
      return await func(...args);
    } finally {
      isRunning = false; 
    }
  }
}

/**
 * retry方法
 * @param {Function} fn - 需要重试的异步函数
 * @param {number} retries - 重试次数
 * @param {number} delay - 每次重试之间的延迟（毫秒）
 * @param {timeout} timeout - 超时时间
 * @returns {Promise} - 返回一个封闭的方法
 */
function retry(fn: Function, retries = 3, delay = 100, timeout = 5000): any {
  return async function (...args: any[]) {
    const startTime = new Date().getTime()
    let curTime = 0
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn(...args)
      } catch (error) {
        curTime = new Date().getTime()
        if (startTime + timeout > curTime) {
          // 超时
          throw error
        }
        if (attempt < retries) {
          console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        } else {
          console.error(`All ${retries + 1} attempts failed.`)
          throw error
        }
      }
    }
  }
}


export { ManualPromise, Store, AdHttp, delay,
  debounce,
  mutex,
  retry,
}
