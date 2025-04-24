import { Platform, platform } from "./AdPlatform";

let debug_enable = CC_DEBUG;
type LogHandle = (...msg: any[]) => void;

let set_debug_enable = function (debug: boolean) {
  debug_enable = debug;
}

let current_time = function (): string {
  let currentTime = new Date()
  let hours = currentTime.getHours().toString().padStart(2, '0')
  let minutes = currentTime.getMinutes().toString().padStart(2, '0')
  let seconds = currentTime.getSeconds().toString().padStart(2, '0')
  let milliseconds = currentTime.getMilliseconds().toString().padStart(3, '0')

  return `${hours}:${minutes}:${seconds}.${milliseconds}`
}

let debug_log = function (tag: string, ...msg: any[]) {
  let currentTime = current_time()
  if (debug_enable && platform === Platform.WEB) {
    console.warn(
      currentTime, tag, ...msg
    )
  }
  if (debug_enable && platform !== Platform.WEB) {
    cc.log(
      currentTime + ': ' + tag, ...msg.map((t) => JSON.stringify(t || ''))
    )
  }
}

let get_log = function (name: string): LogHandle {
  return (...msg: any[]) => debug_log(name, msg)
}

if (window) {
  window.onerror = function (message, source, lineno, colno, error) {
    debug_log('AdSdk', "Global error caught:");
    debug_log('AdSdk', "Message:", message);
    debug_log('AdSdk', "Source:", source);
    debug_log('AdSdk', "Line:", lineno);
    debug_log('AdSdk', "Column:", colno);
    debug_log('AdSdk', "Error object:", error);
  
    // 你可以选择将错误上报到服务器，或记录到日志系统
    return false; // 返回 true 表示“吞掉”这个错误，false 表示继续抛出
  };
  window.addEventListener("unhandledrejection", function (event) {
      debug_log('AdSdk', "Unhandled promise rejection:", event.reason);
      // 可上传日志或做处理
  });
}

export { debug_log, set_debug_enable, get_log, LogHandle}
