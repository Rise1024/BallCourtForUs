// Adminpackage/noticeInfo/noticeInfo.js
const db = wx.cloud.database()
const {
  formatTime
} = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // SponsorId: '',
    // switchSponsor: false,
    NoticeData: {
      noticeTop: '',
      notice: '',
      merchantsNotice: '',
      editer: '',
    },
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
    this.getNoticeInfo()
  },
  // 获取数据
  getNoticeInfo() {
    db.collection('NoticeInfo')
      .get({
        success: res => {
          //console.log('NoticeInfo查询成功', res)
          if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
            this.setData({
              NoticeData: res.data[0]
            })
          }
        },
        fail: err => {
          //console.log('NoticeInfo查询失败', err)
        }
      })
  },

  // 获取输入框的数据
  InputData(e) {
    let key = e.currentTarget.dataset.key
    let value = e.detail.value
    let NoticeData = this.data.NoticeData
    if (key == 'noticeTop') {
      NoticeData['noticeTop'] = value
    }
    if (key == 'notice') {
      NoticeData['notice'] = value
    }
    if (key == 'merchantsNotice') {
      NoticeData['merchantsNotice'] = value
    }
    this.setData({
      NoticeData: NoticeData
    })
  },



  // 提交更新数据
  submitData() {
    let NoticeData = this.data.NoticeData
    let Id = NoticeData._id
    let noticeTop = NoticeData.noticeTop
    let notice = NoticeData.notice
    let merchantsNotice = NoticeData.merchantsNotice
    let editer = wx.getStorageSync('nickName')
    // let editer = userInfo.nickName

    // 调用云函数修改信息
    wx.showLoading({
      title: '正在更新...',
      mask: true
    })
    db.collection('NoticeInfo').where({
      '_id': Id
    }).get({
      success: res => {
        wx.hideLoading()
        if (res.errMsg == "collection.get:ok" && res.data.length == 0) {
          db.collection('NoticeInfo')
            .add({
              data: {
                noticeTop: noticeTop,
                notice: notice,
                merchantsNotice: merchantsNotice,
                editer: editer,
                updateTime: formatTime(new Date())
              },
              success: res => {
                //console.log('添加公告信息成功',res.errMsg)
                if (res.errMsg == "collection.add:ok") {
                  wx.showToast({
                    title: '添加成功',
                    icon: "success",
                    duration: 1000,
                  })
                  this.getNoticeInfo()
                }
              },
              fail: res => {
                wx.hideLoading()
                wx.showToast({
                  title: '添加失败',
                  icon: 'none',
                  duration: 1000,
                })
              }
            })
        } else {
          db.collection('NoticeInfo').doc(Id).update({
            data: {
              noticeTop: noticeTop,
              notice: notice,
              merchantsNotice: merchantsNotice,
              editer: editer,
              updateTime: formatTime(new Date())
            },
            success: res => {
              wx.hideLoading()
              //console.log('更新成功',res.errMsg,res.stats.updated)
              if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
                wx.showToast({
                  title: '更新成功',
                  icon: "success",
                  duration: 1000,
                })
                this.getNoticeInfo()
              }
            },
            fail: res => {
              wx.hideLoading()
              wx.showToast({
                title: '更新失败',
                icon: 'none',
                duration: 1000,
              })
            }
          })
        }
      },
      fail: res => {
        wx.hideLoading()
        wx.showToast({
          title: '更新失败',
          icon: 'none',
          duration: 1000,
        })
      }
    })
  },
})