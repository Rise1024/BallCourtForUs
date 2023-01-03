// Adminpackage/addAdmin/addAdmin.js
const db = wx.cloud.database()
const {
  formatTime
} = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    UserList: [],
    switch: false,
    total: 0,
    page: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let page = this.data.page
    this.getUser(page)
    this.DocCount()
  },

  // 查询数据总数
  DocCount() {
    db.collection('UserList').where({
        'admin': false,
      })
      .count({
        success: res => {
          if (res.errMsg == "collection.count:ok") {
            this.setData({
              total: res.total
            })
          }
        },
        fail: err => {}
      })
  },

  // 查询普通用户
  getUser(page) {
    let UserList = this.data.UserList
    db.collection('UserList').where({
        'admin': false
      })
      .skip(page)
      .limit(10)
      .get({
        success: res => {
          //console.log('查询普通用户成功', res)
          if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
            let data = res.data
            for (let i = 0; i < data.length; i++) {
              UserList.push(data[i])
            }
            this.setData({
              UserList: UserList
            })
          }
        },
        fail: err => {}
      })
  },


  // 添加管理员
  addAdmin(e) {
    //console.log('点击了添加管理员', e)
    let userInfo = wx.getStorageSync('nickName')
    let id = e.currentTarget.dataset.id
    let value = e.detail.value
    if (value) {
      db.collection('UserList').doc(id).update({
        data: {
          admin: true,
          level: Number("1"),
          operator:userInfo,
          addAdminTime:formatTime(new Date())
        },
        success: res => {
          if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
            wx.navigateBack({
              delta: 1,
            })
          } else {
            this.setData({
              switch: false
            })
            wx.showToast({
              title: '添加失败',
              icon: 'none',
              duration: 1000
            })
          }
        },
        fail: err => {
          this.setData({
            switch: false
          })
          wx.showToast({
            title: '添加失败',
            icon: 'none',
            duration: 1000
          })
        }
      })
    }
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let total = this.data.total
    let page = this.data.page
    let UserList = this.data.UserList
    if (UserList.length < total) {
      page = UserList.length
      this.getUser(page)
    } else {
      wx.showToast({
        icon: "none",
        title: '没有数据了哟',
        duration: 1000,
      })
    }
  },

})