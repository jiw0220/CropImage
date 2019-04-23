Page({
    onPress: function (e) {
        const {type} = e.currentTarget.dataset;
        switch (type) {
            case 'demo1':
                wx.navigateTo({url: `/pages/${type}/${type}`});
                break;
            case 'demo2':
                wx.showLoading({mask: true});
                //getImageInfo 的 src 必须是 downloadFile 合法域名
                wx.getImageInfo({
                    src: '../../assets/img2.jpg',
                    success: (res) => {
                        const url = encodeURIComponent(`/${res.path}`);
                        wx.navigateTo({url: `/pages/${type}/${type}?url=${url}`});
                    },
                    fail: (res) => {
                        wx.showModal({title: '加载错误', content: JSON.stringify(res)});
                    },
                    complete: () => {
                        wx.hideLoading();
                    }
                });
                break;
        }
    },
    //DEMO2 Callback
    onCropResult: function (result) {
        this.setData({demo2Result: result});
    },
    onPressClose: function () {
        this.setData({demo2Result: ''});
    }
});