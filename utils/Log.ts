
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
  if (debug_enable) {
    console.warn(
      currentTime, tag, msg.map((t) => t?.toString()).join(' ')
    )
  }
  if (debug_enable) {
    cc.log(currentTime + ': ' + tag, ...msg)
  }
}

let get_log = function (name: string): LogHandle {
  return (...msg: any[]) => debug_log(name, msg)
}

export { debug_log, set_debug_enable, get_log, LogHandle}
