// Adminpackage/Admin/Admin.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    switchAdmin: true,
    adminList: [],
    page:0,
    total: 0,
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
    this.setData({
      page:0,
      total: 0,
      adminList: [],
    })
    let page = this.data.page
    this.getAdmin(page)
    this.DocCount()
  },


  // 查询数据总数
  DocCount() {
    db.collection('UserList').where({
        'admin': true,
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

// 查询所有管理员
  getAdmin(page) {
    db.collection('UserList').where({
        'admin': true
      })
      .orderBy('level','desc')
      .skip(page)
      .limit(10)
      .get({
        success: res => {
          //console.log('查询管理员成功', res)
          if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
            this.setData({
              adminList: res.data
            })
          }
        },
        fail: err => {

        }
      })
  },



  // 跳转添加新管理员页面
  addAdmin() {
    wx.navigateTo({
      url: '../addAdmin/addAdmin',
    })
  },

  // 关闭管理员
  switchAdmin(e) {
    let id = e.currentTarget.dataset.id
    let level = e.currentTarget.dataset.level
    let value = e.detail.value
    const _ = db.command
    if (value == false && level == 1) {
      db.collection('UserList').doc(id).update({
        data: {
          admin: false,
          level: Number("0"),
          operator: _.remove(),
          addAdminTime: _.remove(),
        },
        success: res => {
          if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
            this.onShow()
          } else {
            this.setData({
              switchAdmin: true
            })
            wx.showToast({
              title: '移除失败',
              icon: 'none',
              duration: 1000
            })
          }
        },
        fail: err => {
          this.setData({
            switchAdmin: true
          })
          wx.showToast({
            title: '移除失败',
            icon: 'none',
            duration: 1000
          })
        }
      })
    } else {
      wx.showToast({
        title: '超级管理员不能删除！',
        icon: 'none',
        duration: 1000
      })
      this.setData({
        switchAdmin: true
      })
    }
  },


    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      let total = this.data.total
      let page = this.data.page
      let adminList = this.data.adminList
      if (adminList.length < total) {
          page = adminList.length
          this.getAdmin(page)
      } else {
          wx.showToast({
              icon: "none",
              title: '没有数据了哟',
              duration: 1000,
          })
      }
  },
})