// Adminpackage/adminHome/adminHome.js
var app = getApp();
const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        superAdmin: false, //超级管理员默认为否,按权限显示模块
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (e) {
        // 导航栏显示欢迎管理员
        let nickName = wx.getStorageSync('nickName')
        // let nickName = userInfo.nickName
        wx.setNavigationBarTitle({
            title: `欢迎 ${nickName?nickName:''} 管理员`
        })
        this.adminInfo()
    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    //检查是否为超级管理员，按权限显示模块
    adminInfo() {
        let openId = app.globalData.openid
        //console.log('全局openid', openId)
        wx.showLoading({
            title: '正在验证...',
            mask: true
        })
        db.collection('UserList').where({
            '_openid': openId, //根据全局openid检查该管理员是否未超级管理员
            'admin':true,
        }).field({
            '_openid': true,
            'level': true
        }).get({
            success: res => {
                wx.hideLoading()
                //console.log('查询成功')
                if (res.errMsg == "collection.get:ok" && res.data.length > 0) {
                    //console.log('level', res.data[0].level)
                    //console.log('openid', res.data[0]._openid)
                    if (res.data[0].level === 2 && res.data[0]._openid === openId) {
                        console.log('是超级管理员')
                        this.setData({
                            superAdmin: true, //是超级管理员
                        })
                    }else{
                        console.log('是普通管理员')
                        this.setData({
                            superAdmin: false, //不是超级管理员
                        })
                    }
                }
            },
            fail: err => {
                wx.hideLoading()
            }
        })
    },

    // 跳转函数
    Navigate: function (e) {
        let url = e.currentTarget.dataset.url
        wx.navigateTo({
            url: `${url}`,
        })
    },

})