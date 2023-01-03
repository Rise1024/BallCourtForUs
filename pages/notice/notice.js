// pages/notice/notice.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeTop: '', // 默认公告信息
    notice: '', // 默认公告信息
    headerImg:'',
    nothing:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getNotice()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getNotice()
  },

  // 获取滚动公告数据
  getNotice() {
    db.collection('NoticeInfo')
      .field({
        noticeTop: true,
        notice: true
      })
      .get({
        success: res => {
          wx.stopPullDownRefresh()
          console.log('查询消息成功',res)
          if (res.errMsg == "collection.get:ok") {
            if (res.data[0].noticeTop.length > 0) {
              console.log('走noticeTop的if')
              this.setData({
                noticeTop: res.data[0].noticeTop
              })
            }else{
              console.log('走noticeTop的else')
              this.setData({
                noticeTop:'篮球场地图是一个可以标记篮球场,收集篮球场数据的地图',
              })
            }

            //console.log('notice',res.data[0].notice.length)
            if (res.data[0].notice.length > 0) {
              //console.log('走notice的if')
              this.setData({
                nothing:false,
                notice: res.data[0].notice,
                headerImg:'../image/notice_icon.png'
              })
            }else{
              //console.log('走notice的else')
              this.setData({
                nothing:true
              })
            }
          }
        },
        fail: err => {
          wx.stopPullDownRefresh()
          //console.log('刷新滚动公告信息失败', err)
        }
      })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getNotice()
  },

})