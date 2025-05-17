import { ApiLoginData, ApiReportData } from "../Types"
import { AdHttp, retry, Store } from "./AdUtils"


const defaultHttp = new AdHttp('https://nk.olalay.cn:22001')

function login(data: any) {
  console.log(data)

  defaultHttp.post('oapi.php?act=login', data)
        .then(res => console.log(res))
        .catch( err => console.log(err))
}

/**
 * 加密工具
 */
class Encrypt {
  private static KEY = "(Ljava/lang/String;)V"
  private static _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  static encrypt(data: any): string {
    if (!data) {
      return
    }
    try {
      const json = JSON.stringify(data)
      const bytes = Encrypt.rc4(Encrypt.stringToUint8Array(json), Encrypt.KEY)
      return Encrypt.encodeBytes(bytes)
    } catch (error) {
      console.log('decrypt error:', error)
    }
  }
  static decrypt(data: any): any {
    if (!data) {
      return
    }
    try {
      const bytes = Encrypt.decodeToBytes(data)
      const json = Encrypt.uint8ArrayToString(Encrypt.rc4(bytes, Encrypt.KEY))
      return JSON.parse(json)
    } catch (error) {
      console.log('decrypt error:', error)
    }
  }
  private static rc4(data: Uint8Array, pwd: string): Uint8Array {

    // btoa("123")

    // Base64.encode("str");

    let box = new Uint8Array(256);
    let key = new Uint8Array(256);
    let pwd_length: number = pwd.length
    let data_length: number = data.length;

    for (let i = 0; i < 256; i++) {
        key[i] = (pwd.charCodeAt(i % pwd_length));
        box[i] = i;
    }

    let i = 0;
    for (let j = 0; i < 256; i++) {
        j = (j + box[i] + key[i]) % 256;
        let tmp = box[i];
        box[i] = box[j];
        box[j] = tmp;
    }

    let iOutputChar = new Uint8Array(data.length);

    let a = 0;
    let j = 0;
    i = 0;
    for (; i < data_length; i++) {
        a = (a + 1) % 256;
        j = (j + box[a]) % 256;

        let tmp = box[a];
        box[a] = box[j];
        box[j] = tmp;

        let k = box[((box[a] + box[j]) % 256)];
        iOutputChar[i] = (data[i] ^ k);
    }
    return iOutputChar;
  }
  private static stringToUint8Array(str: string): Uint8Array {
    const uint8Array = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        uint8Array[i] = str.charCodeAt(i);
    }
    return uint8Array;
  }
  private static encodeBytes(input: Uint8Array): string {
    let output = "";
    let chr1: number, chr2: number, chr3: number;
    let enc1: number, enc2: number, enc3: number, enc4: number;
    let i = 0;

    const utf8Bytes = input;

    while (i < utf8Bytes.length) {
      chr1 = utf8Bytes[i++];
      chr2 = i < utf8Bytes.length ? utf8Bytes[i++] : NaN;
      chr3 = i < utf8Bytes.length ? utf8Bytes[i++] : NaN;

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output +=
        Encrypt._keyStr.charAt(enc1) +
        Encrypt._keyStr.charAt(enc2) +
        Encrypt._keyStr.charAt(enc3) +
        Encrypt._keyStr.charAt(enc4);
    }
    return output;
  }
  private static decodeToBytes(input: string): Uint8Array {
    let output = "";
    let chr1: number, chr2: number, chr3: number;
    let enc1: number, enc2: number, enc3: number, enc4: number;
    let i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
      enc1 = Encrypt._keyStr.indexOf(input.charAt(i++));
      enc2 = Encrypt._keyStr.indexOf(input.charAt(i++));
      enc3 = Encrypt._keyStr.indexOf(input.charAt(i++));
      enc4 = Encrypt._keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output += String.fromCharCode(chr1);

      if (enc3 !== 64) output += String.fromCharCode(chr2);
      if (enc4 !== 64) output += String.fromCharCode(chr3);
    }

    const bytes = new Uint8Array(output.length);
    for (let i = 0; i < output.length; i++) {
      bytes[i] = output.charCodeAt(i);
    }
    return bytes;
    // return this._utf8Decode(output);
  }
  private static uint8ArrayToString(uint8Array: Uint8Array): string {
    let str = '';

    // console.log("uint8ArrayToString--uint8Array.length:" + uint8Array.length)

    for (let i = 0; i < uint8Array.length; i++) {
        str += String.fromCharCode(uint8Array[i]);
    }

    // console.log(str)
    // console.log("str--str.length:" + str.length)


    return str;
  }
}

/**
 * 后端API服务
 */
class ApiService {
  private client: AdHttp
  private retryLogin: Function
  private retryReport: Function
  private retryReportGame: Function
  
  constructor(baseUrl: string) {
    this.client = new AdHttp(baseUrl)
    // 配置请求拦截器
    this.client.addRequestInterceptor((ctx) => {
      // 加密数据
      ctx.data = Encrypt.encrypt(ctx.data)
      return ctx
    })
    this.client.addResponseInterceptor((res) => {
      // 解密数据
      return Encrypt.decrypt(res)
    })
    // 配置请求重试
    this.retryLogin = retry((this._doLogin.bind(this)), 3, 100, 10000)
    this.retryReport = retry(this._doReportAd.bind(this), 3, 100, 10000)
    this.retryReportGame = retry(this._doReportGame.bind(this), 3, 100, 10000)
  }

  private _doLogin(data: ApiLoginData): Promise<any> {
    return this.client.post("optv2.php?act=login", data)
  }

  login(data: ApiLoginData): Promise<any> {
    return this.retryLogin(data)
  }
  _doReportAd(data: ApiReportData): Promise<any> {
    return this.client.post("rptv2.php?act=udata", data)
  }
  reportAd(data: ApiReportData): Promise<any> {
    const loginData = Store.cache('API_LOGIN_DATA')
    if (loginData) {
      data.ssid = loginData.ssid
      data.cid = loginData.cid
    } else {
      console.log('未登录')
      return Promise.reject('请先登录后再进行上报')
    }
    return this.retryReport(data)
  }
  _doReportGame(data: any): Promise<any> {
    return this.client.post("rptv2.php?act=action", data)
  }
  reportGame(data: any): Promise<any> {
    return this.retryReportGame(data)
  }
}

const Api = new ApiService("https://nk.olalay.cn:22001")

export {login, Api }
