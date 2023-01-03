// BallCourtPackage/addBallCourt/addBallCourt.js
var app = getApp();
const db = wx.cloud.database();
const {
  formatTime
} = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    BannerImg:[],
    tempBannerImg:[],
    AddressName: '',
    Address: '',
    AddressInfo: '',
    BallCourtLongitude: '',
    BallCourtLatitude:'',
    BallCourtAddress: {},
    CreatTime: '',
    show: true,
    
    // 渲染输入框
    InputList: [
    
      {
        'id': 'AddressInfo',
        'title': '篮球场简介:',
        'placeholder': '填写篮球场简介(例如:兴华公园内50米)',
        'type': 'textarea',
        'maxlength': 100
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
  },

  /**
   * 获取输入框数据
   */
  InputData(e) {
    let key = e.currentTarget.dataset.key
    let value = e.detail.value
    if (key == 'BannerImg') {
      this.setData({
        bannerImg: value
      })
    }
    if (key == 'AddressInfo') {
      this.setData({
        AddressInfo: value
      })
    }
    
  },

  // 选择地址
  chooseLocation() {
    console.log('点击了选择位置', )
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        const longitude = Number(res.longitude) // 经度
        const latitude = Number(res.latitude) // 纬度 
        console.log('获取经纬度', longitude, latitude)
        wx.chooseLocation({
          latitude,
          longitude,
          success: res => {
            console.log('选择的位置里的',res, res.latitude, res.longitude)
            this.setData({
              BallCourtAddress: res,
              BallCourtLatitude: res.latitude,
              BallCourtLongitude: res.longitude
            })
          }
        })
      },
      fail: res => {
        console.log('授权位置信息失败：', res)
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
   * 确认提交按钮
   */
  Submit(e) {
    let addressInfo = this.data.AddressInfo
    let latitude = Number(this.data.BallCourtLatitude)
    let longitude = Number(this.data.BallCourtLongitude)
    console.log('确认提交按钮里的位置信息：', latitude, longitude, typeof latitude, typeof longitude)
    if (addressInfo == "") {
      wx.showToast({
        title: '请填写篮球场简介！',
        duration: 1000,
        icon: "none"
      })
    } else if (latitude == "" && longitude == "") {
      wx.showToast({
        title: '请选择篮球场地址！',
        duration: 1000,
        icon: "none"
      })
    } else {
      this.SubmitData(addressInfo, latitude, longitude)
    }
  },

  // 上传数据
  SubmitData(addressInfo, latitude, longitude) {
    let openId = app.globalData.openid
    let nickName = wx.getStorageSync('nickName')
    // let nickName = userInfo.nickName
    db.collection('BallCourt')
      .add({
        data: {
          audit: false, //审核状态
          // _openid: openId,
          creatorName:nickName,
          addressInfo:addressInfo,
          bannerImg:this.data.BannerImg,
          addressName: this.data.BallCourtAddress.name,
          address: this.data.BallCourtAddress.address,
          longitude: longitude,
          latitude: latitude,
          location: db.Geo.Point(longitude, latitude),
          creatTime: formatTime(new Date())
        },
        success: res => {
          console.log('提交申请成功', res.errMsg)
          if (res.errMsg == "collection.add:ok") {
            wx.showToast({
              title: '提交成功,管理员审核中',
              icon: "none",
              duration: 2000,
            })
            // 提交成功，显示等待审核页面
            this.setData({
              AddressInfo:addressInfo,
              AddressName: this.data.BallCourtAddress.name,
              CreatTime: formatTime(new Date()),
              show: false,
            })
            console.log('提交申请成功show', this.data)
          } else {
            wx.showToast({
              title: '提交失败！请稍后再试',
              icon: 'none',
              duration: 1000,
            })
          }
        },
        fail: err => {
          console.log('提交申请失败', err)
          wx.showToast({
            title: '提交失败！请稍后再试',
            icon: 'none',
            duration: 1000,
          })
        }
      })
  },

 //图片上传
   // 上传图片
   uploadToCloud() {
    let that = this;
    wx.chooseMedia({
      count: 3,         //count属性确定最多可以上传3张
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        wx.showLoading({
          title: '正在上传',
        })    
        console.log(res)
        //赋值给临时数组暂时存储起来
        that.setData({
          tempBannerImg:that.data.tempBannerImg.concat(res.tempFiles[0].tempFilePath)
        })
        //设置图片存储到云存储的位置和图片名称
        let path = "img/" + new Date().getTime() +"-"+ Math.floor(Math.random() * 1000);
        //这里调用了图片上传函数wx.cloud.uploadFile()
        //传给wx.cloud.uploadFile的cloudPath属性的值不能重复！！！巨坑，加个index就可以避免重复了
        const uploadTasks = that.data.tempBannerImg.map((item, index)  => 
        that.uploadFilePromise(index+path, item));
         
        //promise.all方法会等待map方法都执行完全后再继续执行then方法里面的代码 
        Promise.all(uploadTasks)
          .then(data => {
            console.log(data)
            wx.hideLoading()
            wx.showToast({ 
              title: '上传成功', 
              icon: 'none' 
            });
            const newFileList = data.map(item => (item.fileID));
            console.log(newFileList)
            //每次上传成功后，都要清空一次临时数组，避免第二次重复上传，浪费存储资源，
            that.setData({ 
              BannerImg: that.data.BannerImg.concat(newFileList),
              tempBannerImg:[],
            });
            console.log('文件列表:',that.data.BannerImg,typeof that.data.BannerImg)
          })
          .catch(e => {
            wx.showToast({ title: '上传失败', icon: 'none' });
            console.log(e);
          });
    
      }
    })
},
  //上传到云存储，并且获得图片地址
  uploadFilePromise(fileName, chooseResult) {
    console.log(fileName,chooseResult,typeof chooseResult)
    return wx.cloud.uploadFile({
      cloudPath: fileName,
      filePath: chooseResult
    });
  },
    //删除图片 
    delete:function(event){ 
      let that = this; 
      console.log(event) 
      let inde = event.currentTarget.dataset.id 
      //删除数组里面的值 
      that.data.BannerImg.splice(inde,1) 
      that.setData({ 
        BannerImg:that.data.BannerImg, 
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