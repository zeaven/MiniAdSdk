import { AdHttp } from "./AdUtils"

function login(data: any) {

  AdHttp.post('https://nk.olalay.cn:22001/oapi.php?act=login', data)
        .then(res => console.log(res))
        .catch( err => console.log(err))
}

export {login}
