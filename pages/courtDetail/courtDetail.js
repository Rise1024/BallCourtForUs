// pages/courtDetail/courtDetail.js
const app = getApp()
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
    interval: 2000, //轮播图切换时间
    openId: '',
    CourtId: '', //篮球场id
    DetialList: '',
    BannerImg: [],
    BallCourtLongitude: '',
    BallCourtLatitude:'',
    AddressInfo: '',
    AddressName: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let CourtId = options.id
    console.log('从地图传过来的篮球场id', CourtId)

    // 获取全局变量
    app.isLogin()
    let openId = app.globalData.openid
    let UserLogin = app.globalData.UserLogin
    console.log('全局登录状态',UserLogin)
    this.setData({
      CourtId,
      openId,
      UserLogin,
    })
    this.getCourtInfo()
    },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
  },

  //查询篮球场信息
  getCourtInfo() {
    let CourtId = this.data.CourtId
    console.log('查询篮球场的id',CourtId)
    db.collection('BallCourt').where({
        '_id': CourtId
      })
      .get({
        success: res => {
          console.log('查询篮球场成功', res)
          if (res.errMsg == "collection.get:ok") {
            this.setData({
              DetialList: res.data,
              BallCourtLongitude:res.data[0].longitude,
              BallCourtLatitude:res.data[0].latitude,
              BannerImg: res.data[0].bannerImg,
              AddressInfo:res.data[0].addressInfo,
              AddressName:res.data[0].addressName
            })
          }
        },
        fail: err => {
          console.log('查询篮球场失败', err)
        }
      })
  },

  // 导航
  navRoad() {
    wx.openLocation({
      latitude: this.data.BallCourtLatitude,
      longitude: this.data.BallCourtLongitude,
      name: this.data.AddressInfo,
      address: this.data.AddressName,
      scale: 17
    })
  },

      /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  //分享给朋友
  onShareAppMessage: function () {
    var share_title = this.data.StoreName
    return {
      title: share_title,
    }
  },

  //预览图片
  previewImage:function(event){
    console.log(event)
    wx.previewImage({
      urls: [event.currentTarget.dataset.url] // 需要预览的图片http链接列表
    })    
  },
})