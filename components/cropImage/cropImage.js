Component({
    data: {
        bodyWidth: 0,
        bodyHeight: 0,
        footerHeight: 40,
        canvasWidth: 0,
        canvasHeight: 0,
        imgViewMargin: 0,
        imgViewWidth: 0,
        imgViewHeight: 0,
        imgLeft: 0,
        imgTop: 0,
        imgWidth: 0,
        imgHeight: 0,
        imgRatio: 1,
        cutWidth: 0,
        cutHeight: 0,
        cutLeft: 0,
        cutTop: 0,
        result: '',
        isPreview: false,
    },
    imgTouchLength: 0,
    properties: {
        height: Number,
        imgUrl: String
    },
    attached: function () {

    },
    methods: {
        onImageLoad(e) {
            const {width: imgOriginalWidth, height: imgOriginalHeight} = e.detail;
            const {windowWidth} = wx.getSystemInfoSync();
            const windowHeight = this.data.height;
            const footerHeight = 40;
            const imageViewMargin = 16;
            const imgViewWidth = windowWidth - imageViewMargin * 2;
            const imgRatio = imgOriginalWidth / imgViewWidth;
            const imgViewHeight = imgOriginalHeight / imgRatio;
            this.setData({
                bodyWidth: windowWidth,
                bodyHeight: windowHeight - footerHeight,
                footerHeight: footerHeight,
                imgViewMargin: imageViewMargin,
                imgViewWidth: imgViewWidth,
                imgViewHeight: parseFloat(imgViewHeight.toFixed(4)),
                imgLeft: 0,
                imgTop: 0,
                imgWidth: imgViewWidth,
                imgHeight: imgViewHeight,
                imgRatio: imgRatio,
                cutWidth: imgViewWidth,
                cutHeight: imgViewHeight,
                cutLeft: 0,
                cutTop: 0,
                result: ''
            });
        },
        onImageError(e) {
            wx.showModal({title: '初始化失败:图片加载错误', content: e.detail.errMsg});
        },
        onPressCancel() {
            this.triggerEvent('cancel');
        },
        onPressPreview() {
            this._cut().then((resp) => {
                if (resp._result === 0) {
                    this.setData({result: resp.path, isPreview: true});
                } else {
                    wx.showModal({title: '剪裁失败', content: '图片转换错误'});
                }
            });
        },
        onPressConfirm() {
            this._cut().then((resp) => {
                if (resp._result === 0) {
                    this.setData({result: resp.path});
                    this.triggerEvent('confirm', {result: resp.path});
                } else {
                    wx.showModal({title: '剪裁失败', content: '图片转换错误'});
                }
            });
        },
        onPressClose() {
            this.setData({result: '', isPreview: false});
        },
        onResultImageLoad(e) {
            const {width, height} = e.detail;
            console.info('剪裁图片原始大小: ', width, height);
        },
        imageTouchStart(e) { //缩放图片
            let [touch0, touch1] = e.touches;
            this.imgTouchLength = e.touches.length;
            if (this.imgTouchLength === 1) {
                this.imageStartX = touch0.clientX;
                this.imageStartY = touch0.clientY;
            }
        },
        imageTouchMove(e) {
            let [touch0, touch1] = e.touches;
            if (this.imgTouchLength === 1) {
                const moveLengthX = touch0.clientX - this.imageStartX;
                const moveLengthY = touch0.clientY - this.imageStartY;
                const imgLeft = moveLengthX + this.data.imgLeft;
                const imgTop = moveLengthY + this.data.imgTop;
                this.setData({imgLeft, imgTop});
                this.imageStartX = touch0.clientX;
                this.imageStartY = touch0.clientY;
            }
        },
        imageTouchEnd(e) {
            this._correctImagePosition();
        },
        dragPointStart(e) {
            this.dragStartX = e.touches[0].clientX;
            this.dragStartY = e.touches[0].clientY;
            this.initDragcutWidth = this.data.cutWidth;
            this.initDragcutHeight = this.data.cutHeight;
        },
        dragPointMove(e) {
            const {imgViewWidth, imgViewHeight} = this.data;
            const dragMoveX = e.touches[0].clientX;
            const dragMoveY = e.touches[0].clientY;
            const dragLengthX = dragMoveX - this.dragStartX;
            const dragLengthY = dragMoveY - this.dragStartY;
            const cutWidth = this.initDragcutWidth + dragLengthX;
            const cutHeight = this.initDragcutHeight + dragLengthY;
            if (cutWidth < 40) {
                this.setData({cutWidth: 40});
            } else if (cutWidth > imgViewWidth) {
                this.setData({cutWidth: imgViewWidth});
            } else {
                this.setData({cutWidth});
            }
            if (cutHeight < 40 && cutHeight <= imgViewHeight) {
                this.setData({cutHeight: 40});
            } else if (cutHeight > imgViewHeight) {
                this.setData({cutHeight: imgViewHeight});
            } else {
                this.setData({cutHeight});
            }
        },
        dragPointEnd() {
            this._correctImagePosition();
        },
        _correctImagePosition() {
            const {imgLeft, imgTop, imgWidth, imgHeight, cutLeft, cutTop, cutWidth, cutHeight} = this.data;
            if (imgLeft > cutLeft) {
                this.setData({imgLeft: cutLeft});
            } else if (imgLeft + imgWidth < cutLeft + cutWidth) {
                this.setData({imgLeft: cutLeft + cutWidth - imgWidth})
            }
            if (imgTop > cutTop) {
                this.setData({imgTop: cutTop});
            } else if (imgTop + imgHeight < cutTop + cutHeight) {
                this.setData({imgTop: cutTop + cutHeight - imgHeight});
            }
        },
        _cut() {
            const {imgUrl, imgLeft, imgTop, imgRatio, cutWidth, cutHeight, cutLeft, cutTop} = this.data;
            const sx = (cutLeft - imgLeft) * imgRatio;
            const sy = (cutTop - imgTop) * imgRatio;
            const sw = cutWidth * imgRatio;
            const sh = cutHeight * imgRatio;
            wx.showLoading({mask: true});
            return new Promise((resolve) => {
                this.setData({canvasWidth: sw, canvasHeight: sh}, () => {
                    //小程序的坑b
                    const ctx = wx.createCanvasContext('canvas', this);
                    canvasDrawImage(ctx, imgUrl, sx, sy, sw, sh, 0, 0, sw, sh).then(() => {
                        canvasToImagePath({canvasId: 'canvas', w: sw, h: sh, dw: sw, dh: sh, target: this}).then((resp) => {
                            wx.hideLoading();
                            resolve(resp);
                        });
                    });
                });
            });
        }
    }
});


function canvasDrawImage(ctx, imgUrl, sx, sy, sw, sh, dx, dy, dw, dh, reserve = false) {
    return new Promise((resolve) => {
        ctx.drawImage(imgUrl, sx, sy, sw, sh, dx, dy, sw, sh);
        ctx.draw(reserve, () => {
            resolve({_result: 0});
        });
    });
}

function canvasToImagePath({canvasId, w, h, dw, dh, target}) {
    return new Promise((resolve) => {
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: w,
            height: h,
            destWidth: dw,
            destHeight: dh,
            fileType: 'png',
            quality: 1,
            canvasId: canvasId,
            success: function (res) {
                resolve({_result: 0, path: res.tempFilePath});
            },
            fail: function (err) {
                console.info(err);
                resolve({_result: 1, _desc: '图片转换失败'});
            }
        }, target);
    });
}