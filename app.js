App({
  globalData: {
    userInfo: {},
    openid: null,
    UserLogin: false //检测是否登录函数，未登录则提示登录
  },

  //App onLaunch方法小程序一启动，就会最先执行
  onLaunch() {
    wx.cloud.init({
      env:'basketballwx-9ggjuij55bdbda9b', //云开发环境id
      traceUser: true,
    })
    this.getOpenid();
  },
  // 获取用户openid
  getOpenid: function () {
    var app = this;
    var openidStor = wx.getStorageSync('openid');
    if (openidStor) {
      console.log('本地获取openid:', openidStor);
      app.globalData.openid = openidStor;
      app.isLogin();
    } else {
      wx.cloud.callFunction({
        name: 'getOpenid',
        data: {},
        success(res) {
          console.log('云函数获取执行成功', res.result)
          var openid = res.result.openid;
          wx.setStorageSync('openid', openid)
          app.globalData.openid = openid;
          app.isLogin();
        },
        fail(res) {
          console.log('云函数获取失败', res)
        }
      })
    }
  },
  //检测是否登录函数，未登录则提示登录
  isLogin() {
    //console.log('app.isLogin执行了')
    var userInfo = wx.getStorageSync('UserInfo')
    var nickName = wx.getStorageSync('nickName') // 获取缓存的登录信息
    if (userInfo.nickName && userInfo.avatarUrl) {
      //console.log('app.isLogin走if')
      this.globalData.userInfo = userInfo
      this.globalData.nickName = nickName
      this.globalData.UserLogin = true
    } else {
      //console.log('app.isLogin走else')
      this.globalData.UserLogin = false
    }
  },
})