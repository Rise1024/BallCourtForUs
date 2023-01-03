// Adminpackage/BallCourtApprovoed/BallCourtApprovoed.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Id: '',
    showButton: false,
    preview: false,
    DetialList: '',
    BannerImg: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    let id = e.id
    this.setData({
      Id: id
    })
    this.getPublishDetail(id)
  },

  // 查询详细信息
  getPublishDetail(id) {
    wx.showLoading({
      title: '查询中...',
      mask: true
    })
    db.collection('BallCourt').where({
      '_id': id
    }).get({
      success: res => {
        wx.hideLoading()
        console.log('定点篮球场查询成功', )
        if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
          console.log('走if', )
          let data = res.data
          this.setData({
            showButton: true,
            DetialList: data,
            BannerImg: data[0].bannerImg,
          })
        }
      },
      fail: res => {
        wx.hideLoading()
        console.log('获取失败', res)
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
          // 跳转删除图片
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


  // 删除
  Delete() {
    // 删除信息
    wx.showLoading({
      title: '删除中...',
      mask: true
    })
    let Id = this.data.Id

    db.collection('BallCourt').doc(Id).remove({
      success: res => {
        console.log('删除成功', res)
        if (res.errMsg == "document.remove:ok" && res.stats.removed > 0) {
          wx.showToast({
            title: '删除成功',
            icon: "success",
            duration: 1000,
          })
          wx.navigateBack({
            delta: 1,
          })
        }
      },
      fail: err => {
        console.log('删除失败！', err)
        wx.showToast({
          title: '删除失败！',
          icon: 'none',
          duration: 1000,
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