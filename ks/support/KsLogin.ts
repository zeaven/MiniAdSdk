import { login } from "../../utils/Service";

export default function ksLogin() {
  if (globalThis.ks.onShow) {
    globalThis.ks.onShow(onShow)
  }
  
  const res = globalThis.ks.getLaunchOptionsSync()
  onShow(res)
}

function onShow(res: any) {
  const { from, query } = res
  const platform = 'ks'
  const {host : {appId, gameVersion}  } = globalThis.ks.getSystemInfoSync()

  globalThis.ks.login({
    success: function ({code}) {
      const data = {
        appId,platform, mpVersion: gameVersion,
        code, scene: from, clickid:'', creative_id: '',
        ...query
      }
      login(data)
    },
    fail: function (error) {
      console.log(error)
    }
  })
}
