import { AdInvokeNext, AdParam } from "../Types";

/**
 * 延时调用，首次触发，在指定时间后仅执行一次
 * @param func 延时方法
 * @param wait 延时时间(ms)
 * @returns 
 */
function delay(func: Function, wait: number): any {
    let inThrottle: boolean = false;

    return function(next: AdInvokeNext, param: AdParam): any {
        if (!inThrottle) {
            inThrottle = true;
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(func(next, param))
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
  
  return function(next: AdInvokeNext, param: AdParam): any {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(func(next, param));
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
  
  return async function(next: AdInvokeNext, param: AdParam): Promise<any> {
    if (isRunning) {
      return;
    }
    
    try {
      isRunning = true;
      return await func(next, param);
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
 * @returns {Promise} - 返回一个Promise对象
 */
async function retry(fn: Function, retries = 3, delay = 100, timeout = 5000) {
  const startTime = new Date().getTime()
  let curTime = 0
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
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

export {
  delay,
  debounce,
  mutex,
  retry
}