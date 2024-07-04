import { AdHttp } from "../../utils/AdUtils";

function autoLogin(res) {
  if (!globalThis.tt.login) {
    return
  }
  const { microapp: {mpVersion = '', envType = '', appId = ''}, common} = globalThis.tt.getEnvInfoSync()
  const {query: {clickid, projectid = null, promotionid = null, request_id = null, extParam = null}, scene} = res
  globalThis.tt.login({
    force: true,
    success(res) {
      // console.log(`login 调用成功${res.code} ${res.anonymousCode}`);
      const {code, anonymousCode} = res
      const data = {
        code, anonymousCode, scene, clickid,
        projectid,
        promotionid,
        request_id,
        extParam,
        mpVersion,
        appId
      }
      console.log(data)

      AdHttp.post('https://nk.olalay.cn:22001/oapi.php?act=login', data)
        .then(res => console.log(res))
        .catch( err => console.log(err))
    },
    fail(res) {
      console.log(`login 调用失败`);
    },
  });
}

export default {
  login: autoLogin
}
