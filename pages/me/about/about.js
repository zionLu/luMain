// pages/me/about/about.js
Page({
    data:{
        swiperCurrent: 0,
        feedbackValue: '',
        feedbackShow: false
    },
    onLoad:function(){

    },
   /* handleSwiper(e) {
        if(e.detail.current == 1) {
            this.setData({
                feedbackShow: true
            })
        }
        else {
            this.setData({
                feedbackShow: false
            })
        }
    },*/
    handleFbInput(e) {
        this.setData({
            feedbackValue: e.detail.value
        })
    },
    handleSubmit() {
        let feedbackValue = this.data.feedbackValue,self = this
        
        if(feedbackValue.length > 3) {
            wx.request({
                url: 'https://wegdut.yoricklee.com/suggestion',
                method: 'POST',
                data: {
                    token: wx.getStorageSync('token'),
                    suggestion: self.data.feedbackValue
                },
                success: (res) => {
                    console.log(res)
                    wx.showModal({
                        title: '提示',
                        content: '感谢您的反馈！',
                        showCancel: false,
                        success: (res) => {
                            if(res.confirm) {
                                self.setData({
                                    feedbackValue: ''
                                })
                            }
                        }
                    })
                }
            })
            
        }
        else {
            wx.showModal({
                title: '提示',
                content: '请多于4个字！',
                showCancel: false
            })
        }
        
    }
})