import { IAdConfig } from "./Types"

class VivoConfig implements IAdConfig {
  BANNER_ID = ['7bc4697f08804348b9ba77fd3b0d2b30']
  INTERS_ID = ['78f030df9b4e4fcaaf92d917d8096373']
  REWARD_ID = ['04d3a5fcf10a406b883ad1f7866a85c8']
  CUSTOM_ID = ['0af8a02c879d45d287224f1e8746cce6']
  NATIVE_ID = ['7bc4697f08804348b9ba77fd3b0d2b30']
  BOX_ID = ['']
  PORTAL_ID = ['']
}

class OppoConfig implements IAdConfig {
  BANNER_ID = ['199389']
  INTERS_ID = ['114187']
  REWARD_ID = ['199392']
  CUSTOM_ID = ['1194008']
  NATIVE_ID = ['']
  BOX_ID = ['347368']
  PORTAL_ID = ['201138']
  DRAWER_ID = ['336614']
}

class TTConfig implements IAdConfig {
  BANNER_ID = ['']
  INTERS_ID = ['']
  REWARD_ID = ['']
  CUSTOM_ID = ['']
  NATIVE_ID = ['']
  BOX_ID = ['']
  PORTAL_ID = ['']
}

class KsConfig implements IAdConfig {
  APP_ID?: string = 'ks658932922141258643'
  // PACKAGE_NAME?: string = 'com.game.kddnd.rg.huawei'
  BANNER_ID = ['2300012352_03']
  INTERS_ID = ['2300012352_02']
  REWARD_ID = ['2300012352_01']
  CUSTOM_ID = ['']
  NATIVE_ID = ['']
  BOX_ID = ['']
  PORTAL_ID = ['']
}

class Box4399Config implements IAdConfig {
  BANNER_ID = ['']
  INTERS_ID = ['']
  REWARD_ID = ['']
  CUSTOM_ID = ['']
  NATIVE_ID = ['']
  BOX_ID = ['']
  PORTAL_ID = ['']
}

class M4399Config implements IAdConfig {
  BANNER_ID = ['']
  INTERS_ID = ['']
  REWARD_ID = ['']
  CUSTOM_ID = ['']
  NATIVE_ID = ['']
  BOX_ID = ['']
  PORTAL_ID = ['']
}

class AlipayConfig implements IAdConfig {
  BANNER_ID = ['']
  INTERS_ID = ['']
  REWARD_ID = ['']
  CUSTOM_ID = ['']
  NATIVE_ID = ['']
  BOX_ID = ['']
  PORTAL_ID = ['']
}

class HuaweiConfig implements IAdConfig {
  APP_ID?: string = '113807327'
  PACKAGE_NAME?: string = 'com.game.kddnd.rg.huawei'
  BANNER_ID = ['e1zgg0g769']
  INTERS_ID = ['']
  REWARD_ID = ['t0b3b63xwc']
  CUSTOM_ID = ['']
  NATIVE_ID = ['s0igwux3b8']
  BOX_ID = ['']
  PORTAL_ID = ['']
}

export default {
  VivoConfig,
  OppoConfig,
  KsConfig,
  TTConfig,
  Box4399Config,
  M4399Config,
  AlipayConfig,
  HuaweiConfig,
}
