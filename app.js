App({
    data: {
        userInfo: null
    },
    onLaunch() {
        let self = this
        wx.login({
            success: (res) => {
                if(res.code) { 
                    wx.getUserInfo({
                       success: (res1) => {                 
                          wx.request({
                                url: 'https://wegdut.yoricklee.com/getToken',
                                method: 'GET',
                                data: {
                                    code: res.code,
                                    nickName: res1.userInfo.nickName,
                                    avatarUrl: res1.userInfo.avatarUrl
                                },
                                success: (res2) => {
                                    self.data.userInfo = res1.userInfo
                                    if(res2.data.code == 200) {                                
                                        wx.setStorageSync('token',res2.data.data)    
                                        wx.setStorageSync('openid', res2.data.openid)
                                    }
                                    else if(res2.data.code == 405) {
                                        wx.setStorageSync('token',res2.data.data)
                                        wx.setStorageSync('openid', res2.data.openid)
                                        wx.navigateTo({
                                            url: '/pages/me/bind/bind'
                                        })
                                    }     
                                    else {
                                        wx.showToast({
                                            title: '未知错误，请重新打开小程序！',
                                            duration: 3000
                                        })
                                    }                           
                                },
                                fail: (res) => {
                                    console.log(res)
                                },
                                complete: (res3) => {
                                    console.log(res3)
                                }
                            })                                       
                        },
                        fail: () => {
                            wx.showModal({
                                title: '提示',
                                content: '请重新授权',
                                showCancel: false
                            })
                        }
                    }) 
                    
               }
            }
        })
    }
})