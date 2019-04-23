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
        safePaddingBottom: 0,
        cropHeight: 0,
    },
    onLoad: function (options) {
        const {windowHeight} = wx.getSystemInfoSync();
        const paddingBottom = getSafePaddingBottom();
        this.setData({
            cropHeight: windowHeight - paddingBottom,
            safePaddingBottom: paddingBottom,
            url: decodeURIComponent(options.url)
        });
    },
    onResult: function (e) {
        const {result} = e.detail;
        const pages = getCurrentPages();
        const page = pages[pages.length - 2];
        (page && typeof page.onCropResult === 'function') && page.onCropResult(result);
        wx.navigateBack();
    },
    onCancel: function () {
        wx.navigateBack();
    },
});
