# 介绍

CropImage 是基于微信小程序 简单的实现图片剪裁功能.


# 使用方式

- 将components/cropImage 复制到工程目录下


- 在 页面.json 中加入以下代码

```
  "usingComponents": {
    "crop-image": "/components/cropImage/cropImage"
  }
```

- 在 页面.wxml 中加入以下代码

```
<crop-image imgUrl="{{url}}" height="{{cropHeight}}" bindconfirm="onResult" bindcancel="onCancel" />
``` 

# Properties

1. imgUrl {String} 使用 wx.getImageInfo 加载后得到的图片地址. wx.getImageInfo 的使用方式请参照微信小程序API 注意设置小程序下载域名
2. height {Number} 整体高度(px)
3. bindconfirm {Function} 点击 确定 后的回调方法
4. bindcancel {Function} 点击 取消 后的回调方法

# 注意

1. Demo中所使用的图片是本地资源,所以请注意 getImageInfo 回调后的路径,正常网络资源是不用拼 '/' 的.

2. 使用Demo时请修改 project.config.json 中的 appid


 