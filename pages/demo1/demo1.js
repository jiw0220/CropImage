function getSafePaddingBottom(sysInfo) {
    sysInfo = sysInfo || wx.getSystemInfoSync();
    const {platform, screenHeight, screenWidth} = sysInfo;
    if (platform === 'devtools') {
        return 34;
    } else if (platform === 'android') {
        return 0;
    } else {
        if (screenHeight / screenWidth > 1.78) {
            return 34;
        } else {
            return 0;
        }
    }
}

Page({
    data: {
        list: ['../../assets/img1.jpg', '../../assets/img2.jpg'],
        cropHeight: 0,
        current: -1,
    },
    onLoad: function (options) {
        const {windowHeight} = wx.getSystemInfoSync();
        const paddingBottom = getSafePaddingBottom();
        this.setData({cropHeight: windowHeight - 128 - paddingBottom}, () => this.changeImg(0));
    },
    onPressImg: function (e) {
        const {index} = e.currentTarget.dataset;
        this.changeImg(index);
    },
    onResult: function (e) {
        console.info(e.detail);
    },
    onCancel: function () {
        this.changeImg(this.data.current);
    },
    changeImg: function (index) {
        const {list} = this.data;
        const url = list[index];
        wx.showLoading({mask: true});
        wx.getImageInfo({
            src: url,  //getImageInfo 的 src 必须是 downloadFile 合法域名
            success: (res) => {
                this.setData({url: `/${res.path}`});
            },
            fail: (res) => {
                wx.showModal({title: '加载错误', content: JSON.stringify(res)});
            },
            complete: () => {
                wx.hideLoading();
            }
        });
        this.setData({current: index});
    },
});
