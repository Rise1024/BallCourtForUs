### 项目简介

项目使用小程序云开发
参考文档https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started

### 导入项目 配置项目过程

1. 打开微信开发者工具，导入项目；

2. 填写自己的APPID；

3. 开通云开发环境（请参考官方文档），上传 `cloud` 文件夹下所有的云函数，上传时选择 `上传并部署：云端安装依赖`；


4. 修改 `app.js` 如下：

```javascript
    wx.cloud.init({
        env: '(填写你自己云环境的ID)',
        traceUser: true,
    })
```

6. 登录之后可以把自己改成超级管理员 `UserList`表里把admin修改为true,把 `level`字段修改为：2 (代表超级管理员，具有添加普通管理员的权限)、1 (代表普通管理员)、0（代表普通用户）；







