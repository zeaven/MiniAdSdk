declare namespace qg {
  interface SystemInfo {
    brand: string;
    model: string;
    pixelRatio: number;
    screenWidth: number;
    screenHeight: number;
    windowWidth: number;
    windowHeight: number;
    language: string;
    version: string;
    platform: string;
  }

  function getSystemInfoSync(): SystemInfo;

  // Add OPPO/Vivo style toast
  function showToast(params: {
    title: string;
    duration?: number;
  }): void;
  function showToast(params: {
    message: string;
    duration: number;
  }): void;

  // Huawei specific APIs
  function createBannerAd(options: any): any;
  function createInterstitialAd(options: any): any;
  function createNativeAd(options: any): any;
  function createRewardedVideoAd(options: any): any;
  function createBoxBannerAd(options: any): any;
  function createGameBannerAd(options: any): any;
  function createBoxPortalAd(options: any): any;
  function createGamePortalAd(options: any): any;
  function createGameDrawerAd(options: any): any;
  function createNewNativeAd(options: any): any;
  function createCustomAd(options: any): any;
  function setEnableDebug(options: {enableDebug: boolean}): void;
}

declare namespace my {
  // Alipay specific APIs
  interface SystemInfo {
    brand: string;
    model: string;
    pixelRatio: number;
    screenWidth: number;
    screenHeight: number;
    windowWidth: number;
    windowHeight: number;
    language: string;
    version: string;
    platform: string;
  }

  function getSystemInfoSync(): SystemInfo;
  function setEnableDebug(options: {enableDebug: boolean}): void;
  function showToast(options: {content: string, duration?: number}): void;
  function createBannerAd(options: any): any;
  function createInterstitialAd(options: any): any;
  function createRewardedAd(options: any): any;
}

declare global {
  interface Window {
    qg: typeof qg;
    my: typeof my;
  }

  // OPPO/Vivo specific extensions
  interface QGWithOppoVivo {
    createBannerAd(options: any): any;
    createInterstitialAd(options: any): any;
    createRewardedVideoAd(options: any): any;
    createBoxBannerAd(options: any): any;
    createBoxPortalAd(options: any): any;
    createCustomAd(options: any): any;
    showToast(params: {
      message: string;
      duration: number;
    }): void;
  }
}