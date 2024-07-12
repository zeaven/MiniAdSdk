/**
 * 抖音tt.onShow方法必须在game.js运行期间才能监听
 * cocos打包的抖音是自动生成game.js文件，而且加载cocos启动文件后已经退出game.js运行期间，所以cocos启动后无法监听到tt.onShow方法
 * 导入js插件可以让cocos在game.js运行期间加载插件js文件，对tt.onShow方法的监听进行改造
 * 让cocos启动后也能监听到，其他的tt系统周期方法也一样适用
 */
!function () {
  if (window.tt && !window.tt_onShow) {
    // window.tt_onShow = new Promise((resolve) => {
    //   window.tt.onShow(res => resolve(res));
    // });
    let _callback = null;
    let _onShowRes = null;
    window.tt_onShow = (callback) => {
      _callback = callback;
      _onShowRes && _callback(_onShowRes);
    }
    window.tt.onShow(res => {
      _onShowRes = res;
      _callback && _callback(res);
    })
  }
}();
