import { login } from "../../utils/Service";

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

      login(data)
    },
    fail(res) {
      console.log(`login 调用失败`);
    },
  });
}

export default {
  login: autoLogin
}
