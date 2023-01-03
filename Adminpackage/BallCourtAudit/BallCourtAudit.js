// Adminpackage/BallCourtAudit/BallCourtAudit.js
const db = wx.cloud.database()
const {
  formatTime
} = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    Id: '',
    userId: '',
    DetialList: '',
    interval: 2000,
    duration: 1200,
    BannerImg: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    let id = e.id
    //console.log('从篮球场管理传过来的id', id)
    this.setData({
      Id: id
    })
    // this.getBallCourt(id)
  },
  onShow: function(){
    let Id = this.data.Id
    this.setData({ 
      BannerImg:[], 
    }) 
    this.getBallCourt(Id)
  },

  // 查询定点篮球场信息
  getBallCourt(id) {
    wx.showLoading({
      title: '查询中...',
      mask: true
    })
    db.collection('BallCourt').where({
      '_id': id
    }).get({
      success: res => {
        wx.hideLoading()
        console.log('定点篮球场申请查询成功', )
        if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
          let data = res.data
          this.setData({
            showButton: true,
            DetialList: data,
            BannerImg : data[0].bannerImg,
          })
          console.log("图片列表:",this.Date.BannerImg)
        }
      },
      fail: res => {
        wx.hideLoading()
        //console.log('获取失败', res)
      }
    })
  },


  // 删除确认提示
  deleteshowModal() {
    // 进行确认提示
    wx.showModal({
      title: '删除提示',
      content: '删除后,不能恢复,是否确定继续删除?',
      confirmText: '确定',
      confirmColor: '#ff0080',
      cancelText: '取消',
      mask: true,
      success: res => {
        if (res.confirm) {
          // 跳转删除
          this.DeleteImg()
        }
      }
    })
  },

// 删除关联图片
DeleteImg() {
  let bannerImg = this.data.BannerImg
  wx.cloud.deleteFile({
    fileList: bannerImg,
    success: res => {
      // 图片删除成功
      if (res.errMsg == "cloud.deleteFile:ok") {
        console.log('删除关联图片成功', )
        // 跳转删除
        this.Delete()
      }
    },
    fail: err => {
      console.log('图片删除失败！', err)
      wx.showToast({
        title: '图片删除失败！',
        mask: true,
        icon: 'none'
      })
    }
  })
},

 // 删除信息
  Delete() {
    wx.showLoading({
      title: '正在删除...',
      mask: true
    })
    let Id = this.data.Id
    db.collection('BallCourt').doc(Id).remove({
      success: res => {
        wx.hideLoading()
        if (res.errMsg == "document.remove:ok" && res.stats.removed > 0) {
          wx.navigateBack({
            delta: 1,
          })
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          title: '删除失败！',
          icon: 'none',
          duration: 1000,
        })
      }
    })
  },

  


  // 发布按钮
  DoPublishing() {
    wx.showModal({
      title: '确认提示',
      content: `确定通过审核吗?`,
      success: res => {
        if (res.confirm) {
          // 发布
          this.publish()
        }
      }
    })
  },

  // 发布
  publish() {
    let Id = this.data.Id
    let userInfo = wx.getStorageSync('nickName')
    // let auditor = userInfo.nickName
    db.collection('BallCourt').doc(Id).update({
      data: {
        audit: true,
        auditorName: userInfo,
        auditTime: formatTime(new Date()),
      },
      success: res => {
        if (res.errMsg == "document.update:ok" && res.stats.updated > 0) {
          // 发布成功，返回审核列表
          wx.navigateBack({
            delta: 1
          })
        }
      },
      fail: err => {
        wx.showToast({
          title: '通过审核失败！',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  //预览图片
  previewImage:function(event){
    console.log(event)
    wx.previewImage({
      urls: [event.currentTarget.dataset.url] // 需要预览的图片http链接列表
    })    
  },
})