// pages/me/me.js
var app = getApp();
const db = wx.cloud.database()
const {
  formatTime
} = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    UserLogin: false,
    nickName:'',
    // userInfo: null,
    Lv: '1',
    Admin: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('个人中心的onLoad执行了')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('个人中心的onShow执行了')
    app.isLogin() // 全局变量
    this.setData({
      UserLogin: app.globalData.UserLogin,
      nickName: app.globalData.nickName
    })
    this.IsAdmin()
  },
  
  // 检查是否为管理员
  IsAdmin() {
    let openId = app.globalData.openid
    wx.showLoading({
      title: '正在检验...',
      mask: true
    })
    db.collection('UserList').where({
        '_openid': openId, //根据全局的openid去检查该用户是否未管理员
        'admin': true,
      }).count()
      .then(res => {
        wx.hideLoading()
        if (res.total > 0) {
          this.setData({
            Admin:true
          })
        } else {
          wx.showToast({
            title: '欢迎回来,为了社区完善,发布您身边的篮球场吧',
            icon: 'none',
            mask:true,
            duration: 1000
          })
        }

      })
      .catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误！请稍后重试',
          icon: 'none',
          mask:true,
          duration: 1000,
        })
      })
  },

  navigateToAdmin() {
    let UserLogin = this.data.UserLogin
    if (UserLogin) {
      wx.navigateTo({
        url: '../../Adminpackage/adminHome/adminHome'
      })
    } else {
      // 提示登录
      wx.showToast({
        title: '请先登录！',
        icon: 'none',
        mask:true,
        duration: 1000,
      })
    }
  },

  //获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料', //声明获取用户信息的用途
      success: (res) => {
        console.log('点击获取用户信息成功', res, res.userInfo)

        wx.showLoading({
          title: '登录中...',
        })
        let openId = app.globalData.openid
        let userInfo = res.userInfo
        let nickNameRandom= "NBA状元"+Math.random().toString(36).substring(2)
        console.log("获取昵称:",nickNameRandom)
        db.collection('UserList').where({
          '_openid': openId
        }).get({
          success: res => {
            wx.hideLoading()
            console.log('根据全局openid查询用户表成功', res.data.length, res)
            if (res.errMsg == "collection.get:ok" && res.data.length == 0) { //length等于0，证明没有该用户，走写入数据库
              console.log('数据库里没有该用户，走if')
                wx.getLocation({
                  type: 'gcj02',
                  success: res => {
                    const longitude = Number(res.longitude) // 经度
                    const latitude = Number(res.latitude) // 纬度 
                    console.log('获取经纬度', longitude, latitude)
                    db.collection('UserList') // 把用户信息写入数据库的用户表
                    .add({
                      data: {
                        avatarUrl: userInfo.avatarUrl,
                        nickName: nickNameRandom,
                        Lv: Number(1),
                        level: Number(0),
                        admin: false,
                        longitude: longitude,
                        latitude: latitude,
                        location: db.Geo.Point(longitude, latitude),
                        registerTime: formatTime(new Date()),
                        addAdminTime:'',
                        operator:''
                      },
                      success: res => {
                        wx.hideLoading()
                        console.log('写入成功', res.errMsg, res)
                        if (res.errMsg == "collection.add:ok") {
                          wx.setStorageSync('nickName', nickNameRandom) //保存用户信息保存到本地缓存
                          wx.setStorageSync('UserInfo', userInfo) 
                          this.setData({
                            // userInfo:userInfo,
                            nickName: nickNameRandom,
                            UserLogin: true,
                            Lv: "1"
                          })          
                          wx.showToast({
                            title: '恭喜,登录成功',
                            icon: "success",
                            mask:true,
                            duration: 1000,
                          })
                        }
                      },
                      fail: err => {
                        wx.hideLoading()
                        console.log('用户信息写入失败', err)
                        // 提示网络错误
                        wx.showToast({
                          title: '登录失败，请检查网络后重试！',
                          icon: 'none',
                          mask:true,
                          duration: 1000,
                        })
                      }
                    })
                  },
                  fail: res => {
                    //console.log('授权位置信息失败：', res)
                    wx.showModal({
                      title: "申请授权位置信息",
                      content: "需要手动打开获取位置信息！如果还是不能使用定位功能，请关闭5G模式，再重试！",
                      confirmText: "去设置",
                      success: res => {
                        if (res.confirm) {
                          wx.openSetting()
                        }
                      }
                    })
                  }
                })
            } else {
              wx.hideLoading()
              console.log('走else,数据库里已存有用户信息,直接登录，不用写入数据库')
              wx.setStorageSync('nickName', nickNameRandom)
              wx.setStorageSync('UserInfo', userInfo) //保存用户信息保存到本地缓存
              //保存用户信息保存到本地缓存
              this.setData({
                // userInfo:userInfo,
                nickName: nickNameRandom,
                UserLogin: true,
                Lv: res.data[0].Lv,
              })
              //更新全局状态
              app.globalData({
                nickName: nickNameRandom,
                UserLogin: true,
              })
            }
          },
          fail: err => {
            wx.hideLoading()
            console.log('根据全局openid查询用户表失败', err)
            // 提示网络错误
            wx.showToast({
              title: '网络错误！请稍后再试',
              icon: 'none',
              mask:true,
              duration: 700,
            })
          }
        })
      },
      fail: err => {
        wx.hideLoading()
        console.log('用户信息获取失败', err)
        wx.showToast({
          title: '网络错误！请稍后再试',
          icon:'none',
          mask:true,
          duration:700
        })
      }
    })
  },

  /**
   * 发布篮球场
   */
  AddBallCourt(e) {
    let UserLogin = this.data.UserLogin
    if (UserLogin) {
      wx.navigateTo({
        url: '../../BallCourtPackage/addBallCourt/addBallCourt',
      })
    } else {
      // 提示登录
      wx.showToast({
        title: '请先登录！',
        icon: 'none',
        mask:true,
        duration: 1000,
      })
    }
  },

  // 关于我们
  about() {
    wx.navigateTo({
      url: '../about/about',
    })
  },


  // 清除数据退出
  exit() {
    let UserLogin = this.data.UserLogin
    if (UserLogin) {
      wx.showToast({
        title: '退出成功',
        icon: 'success',
        mask:true,
        duration: 1000,
      })
      this.setData({
        UserLogin: false,
        // Admin:false,
        // nickName:'',
        userInfo:{}
      })
      wx.removeStorageSync('nickName')
      wx.removeStorageSync('UserInfo')
    } else {
      // 提示登录
      wx.showToast({
        title: '你还未登录，请先登录！',
        icon: 'none',
        mask:true,
        duration: 1000,
      })
    }
  },
})