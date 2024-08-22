//特定无法区分的平台直接改这里

let Platform = cc.Enum({
  WX: 'wx',
  Android: 'Android',
  IOS: 'IOS',
  QQ: 'qq',
  FB: 'fb',
  WEB: 'web',
  OPPO: 'oppo',
  VIVO: 'vivo',
  TT: 'tt',
  M4399: '4399',
  BOX4399: 'box4399',
  KS: 'ks',
  ALIPAY: 'alipay',
  HUAWEI: 'huawei',
})


let getPlatform = (): string => {
    let platform = '';
    let isKSGame = typeof globalThis.KSGameGlobal != 'undefined'
    if (isKSGame) {
      platform = Platform.KS
    } else if (
      CC_NATIVERENDERER &&
      (cc.sys.OS_ANDROID == cc.sys.os || cc.sys.OS_LINUX == cc.sys.os)
    ) {
      platform = Platform.Android
    } else if (
      CC_NATIVERENDERER &&
      (cc.sys.OS_IOS == cc.sys.os || cc.sys.OS_OSX == cc.sys.os)
    ) {
      platform = Platform.IOS
    // } else if (globalThis.qg) {
      // platform = Platform.QQ
    } else if (cc.sys.ALIPAY_GAME) {
      platform = Platform.ALIPAY
    } else if (cc.sys.platform === cc.sys.OPPO_GAME) {
      platform = Platform.OPPO
    } else if (cc.sys.platform === cc.sys.VIVO_GAME) {
      platform = Platform.VIVO
    } else if (globalThis.tt) {
      platform = Platform.TT
    } else if (globalThis.FBInstant) {
      platform = Platform.FB
    } else if (globalThis.h5api) {
      platform = Platform.M4399
    } else if (cc.sys.HUAWEI_GAME == cc.sys.platform) {
      platform = Platform.HUAWEI
    } else if (globalThis.gamebox) {
      platform = Platform.BOX4399
    } else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
      platform = Platform.WX
    } else if (CC_PREVIEW) {
      platform = Platform.WEB
    }
    
    return platform;
}

//游戏平台ID(1:微信小游戏; 2:QQ小游戏，3：Oppo小游戏,4:Vivo小游戏,5:头条小游戏;)

let getPLATID = (): number => {
    switch (getPlatform()) {
        case Platform.WEB:
            return 2;
        case Platform.WX:
            return 1;
        case Platform.QQ:
            return 4;
        case Platform.OPPO:
            return 2;
        case Platform.VIVO:
            return 1;
        case Platform.TT:
            return 3;
        default:
            return 99;
    }
    
    
}


export {getPlatform, getPLATID, Platform}
