// pages/BallCourt/BallCourt.js
const db = wx.cloud.database();
const app = getApp();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    muteKey:false,//声音默认是开启
    innerAudioContext:'',//播放实例
    longitude: "",//经
    latitude: "",//纬
    markers: [],//篮球场结果数组
    notice: '这是一款寻找野生篮球场的小程序', // 默认公告信息
    openId: '',
    Address: '', //篮球场地址
    AddressInfo: '', //篮球场简介
    AddressName: '', //篮球场详细地址
    BannerImg: [],
    AddressResult:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('附近野生篮球场页面的onLoad执行了')

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('附近野生篮球场页面的onShow执行了')
    
    let innerAudioContext = wx.createInnerAudioContext();//创建普通播放实例
    this.setData({
      innerAudioContext,
    })
    this.getLocation()
  },

  /**
   * 生命周期函数--页面隐藏
   */
  onHide: function () {
    console.log('附近篮球页面的onHide执行了')

    clearInterval(this.interval)//清除计时器

    this.data.innerAudioContext.stop();//页面切换暂停播放
  },


  //声音开关
  muteKey(){  
    if(this.data.muteKey){
      this.setData({
        muteKey:false,
      })
    }else{
      this.setData({
        muteKey:true,
      })
    }
  },


  // 获取位置信息
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      success: res => {
        const longitude = res.longitude // 经度
        const latitude = res.latitude // 纬度 
        console.log('获取初始经纬度', longitude, latitude)
        this.setData({
          latitude,
          longitude
        });
        this.getNearMerchants()
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
  },

  /**
   * 查询附近篮球场
   */
  getNearMerchants() {
    //console.log('执行了查询附近篮球场')
    let longitude = this.data.longitude //自己的位置
    let latitude = this.data.latitude
    db.collection('BallCourt').where({
        audit: true,
        location: _.geoNear({
          geometry: db.Geo.Point(longitude, latitude),
          minDistance: 0,
          maxDistance: 6000,
        }),
      })
      .get()
      .then(res => {
        console.log('查询到附近篮球场成功', res,res.data.length)
        let data = res.data;
        let result = [];
        if (data.length) {
          for (let i = 0; i < data.length; i++) {
            let Info = data[i].addressInfo
            result.push({
              iconPath: data[i].bannerImg[0], // 图标
              id: data[i]._id,
              latitude: data[i].latitude, //篮球场位置
              longitude: data[i].longitude,
              width: 50, // 图标大小
              height: 50,
              callout:{	// 气泡
                content:`${Info}`,
                color:'#666666',
                bgColor: '#fff',
                fontSize:14,
                textAlign: 'center',
                borderRadius:5,
                borderWidth:1,
                borderColor:'#fff',
                padding:5,
                display:'ALWAYS'
              }
            });
          }
          if(this.data.muteKey == false){
            this.data.innerAudioContext.autoplay = true
            this.data.innerAudioContext.src = 'pages/mp3/have_bask.mp3'
            this.data.innerAudioContext.onPlay(() => {
              console.log('开始播放你附近有人标记了野生篮球场')
            })
          }
          this.setData({
            markers: result,//数组类型
            notice: '【系统提示】：你附近有很多人标记了野生篮球场,快去看看吧'
          });

        } else {

          if(this.data.muteKey == false){
            this.data.innerAudioContext.autoplay = true
            this.data.innerAudioContext.src = 'pages/mp3/no_bask.mp3'
            this.data.innerAudioContext.onPlay(() => {
              console.log('你附近暂时没有人标记篮球场,若果你知道的话来标记一下吧')
            })
          }

          this.setData({
            notice: '【系统提示】：你附近暂时没有人标记篮球场...'
          })

          this.interval = setInterval(() => { // 30秒后显示默认公告信息
            this.setData({
              notice: '欢迎使用【篮球地图】', // 默认公告信息
            })
          }, 30000);
        }

      })

      .catch(err => {
        console.log('查询附近篮球场失败', err)
        this.setData({
          notice: '欢迎使用【篮球地图】', // 默认公告信息
        })
      })
  },

    /**
   * 点击地图上的篮球场图标进入篮球场详情页面
   */
  markertap(e) {
    console.log('点击在线篮球场地图mark', e)

    //用手机调试的时候，把这个注释掉
    wx.navigateTo({
      url: '/pages/courtDetail/courtDetail?id=' + e.currentTarget.dataset.id
    })

    // 真机调试，可以动态获取到点击mark的id
    // wx.navigateTo({
    //   url: '/pages/courtDetail/courtDetail?id=' + e.detail.markerId
    // })
  },


  /**
   * 点击地图上的篮球场图标进入篮球场详情页面
   */
  // markertap(e) {
  //   console.log('点击篮球场', e)
  //     let CourtId = e.detail.markerId
  //     console.log('查询篮球场的id',CourtId)
  //     db.collection('BallCourt').where({
  //         '_id': CourtId
  //       })
  //       .get({
  //         success: res => {
  //           console.log('查询篮球场成功', res)
  //           if (res.errMsg == "collection.get:ok") {
  //             this.setData({
  //               AddressResult: res.data,
  //               AddressName: res.data[0].addressName,
  //               AddressInfo: res.data[0].addressInfo,
  //               Address:   res.data[0].address,
  //               latitude:  res.data[0].latitude,
  //               longitude: res.data[0].longitude,
  //               BannerImg: res.data[0].bannerImg,
  //             })
  //           }
  //         },
  //         fail: err => {
  //           console.log('查询篮球场失败', err)
  //         }
  //       })
  //     wx.openLocation({
  //     latitude: this.data.latitude,
  //     longitude: this.data.longitude,
  //     name: this.data.AddressInfo,
  //     address: this.data.Address,
  //     scale: 17
  //   })
  // },





  useTips() {
    wx.showModal({
      title: "使用提示",
      content: "地图页面会显示你附近的篮球场，点击图标可导航去篮球场",
      confirmText: '确定',
      confirmColor: '#FA805C',
      cancelText: '取消',
      cancelColor: '#7CCD7D',
      success: res => {
        if (res.confirm) {
          wx.showModal({
            title: "关于本软件",
            content: "“篮球场地图是一个可以标记篮球场,收集篮球场数据的地图”",
            confirmText: '确定',
            confirmColor: '#FA805C',
            cancelText: '取消',
            cancelColor: '#7CCD7D',
            success: res => {
              if (res.confirm) {}
            }
          })
        }
      }
    })
  },

  //回到自己的可视范围
  MyLocation() {
    let mpCtx = wx.createMapContext("map");
    mpCtx.moveToLocation();
  },

  /**
   * 用户点击右上角分享
   */
  //分享给朋友
  onShareAppMessage: function () {
    return {
      title: '有了篮球场地图从此不再和篮球擦肩而过 ye~耶',
    }
  },
  //分享朋友圈
  onShareTimeline: function (res) {
    var share_notice = this.data.notice
    return {
      title: '有了篮球场地图从此不再和篮球擦肩而过 ye~耶',
      query: share_notice,
    }
  }
})