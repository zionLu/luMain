const qiniu = require('../../../assets/js/qiniu.js')
Page({
    data:{
        name: null,
        content: null,
        image: null,
        imageURL: null,
        loading: null
    },
    handleChooseImage() {
        let self = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'], 
            success: (res) => {
                self.setData({
                    image: res.tempFilePaths[0]
                });        
            }
        })
    },
    handleSubmit() {
        let self = this
        self.setData({
            loading: 'loading'
        })
        let start = () => {  
            let promise = new Promise((resolve,reject) => {
                if(self.data.image) {  
                    let filePath = self.data.image
                    qiniu.upload(filePath, (res) => {
                        let imageURL = 'http://' + res.imageURL
                       self.setData({
                           imageURL: imageURL
                       })
                        resolve(imageURL)
                    }, (error) => {
                        
                    }, {
                        uploadURL: 'https://up-z2.qbox.me', 
                        domain: 'oox3shbsf.bkt.clouddn.com/', 
                        uptokenURL: 'https://wegdut.yoricklee.com/uptoken'
                    })
                    
                } 
                else {
                    let imageURL = null
                    self.setData({
                        imageURL: imageURL
                    })
                    resolve(imageURL)
                }    
            })
            return promise
        }
        start().then((imageURL) => {
            let phone = () => {
                let model = null
                wx.getSystemInfo({
                    success: (res) => {
                        if(res.model.slice(0,6) == 'iPhone') {
                            model = res.model.split('<')[0]
                        }
                        else {
                            model = res.model
                        }               
                    }
                })
                return model
            }
            let adminList = ['ojRfq0MVXOcUuP3gb8NBqJix4GaE', 'ojRfq0IGDiuVjaLHWkzDOteY4oEE']
            let openid = wx.getStorageSync('openid')
            for (let i in adminList) {
                if (openid == adminList[i]) {
                    self.setData({
                        name: 'WeGDUT开发者'
                    })
                }
            }
            wx.request({
                url: 'https://wegdut.yoricklee.com/gdutWall/send',
                method: 'POST',
                data: {
                    token: wx.getStorageSync('token'),
                    content: self.data.content,
                    imgUrl: self.data.imageURL,
                    name: self.data.name,
                    phone: phone()
                },
                success: (res) => {
                    self.setData({
                        loading: null
                    })
                    if(res.data.code == 200) {
                        wx.showModal({
                            title: '提示',
                            content: '贴卡片成功',
                            showCancel: false,
                            success: (res) => {
                                wx.switchTab({
                                    url: '/pages/campus/campus',                  
                                })
                            }
                        })
                        
                    }
                    else {
                        wx.showModal({
                            title: '提示',
                            content: '内容不完整'
                        })
                    }                
                }
            })
        })    
    },
    handlePreview() {
        wx.previewImage({
            current: e.currentTarget.id,
            urls: [this.data.image]
        })
    },
    handleContent: function(e) {
        this.setData({
            content: e.detail.value
        })
    },
    handleAnon: function(e) {
        if(e.detail.value) {
            this.setData({
                name: '匿名用户'
            })
        }
        else {
            this.setData({
                name: null
            })
        }
    }
})