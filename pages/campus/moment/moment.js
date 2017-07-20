Page({
    data: {
        card: null,
        name: null,
        commentValue: '',
        commentInputFocus: false,
        anonValue: false,
        handle: {
            AnonShow: false,
            AnonTemp: false
        },
        loading: 'loading'    
    },
    getDetail(uuid) {
        let self = this
        wx.request({
            url: 'https://wegdut.yoricklee.com/gdutWall/detail',
            method: 'POST',
            data: {
                token: wx.getStorageSync('token'),
                uuid: uuid
            },
            success: (res) => {
                let card = res.data.data
                let handleTime = (created_time) => {
                    let date = new Date()
                    let nowTime = date.getTime()
                    if(parseInt((nowTime - created_time)/2592000000) >= 1) {
                        return parseInt((nowTime - created_time)/2592000000) + '月前'
                    }
                    else if(parseInt((nowTime - created_time)/86400000) >= 1) {
                        return parseInt((nowTime - created_time)/86400000) + '天前'
                    }
                    else if(parseInt((nowTime - created_time)/3600000) >= 1) {
                        return parseInt((nowTime - created_time)/3600000) + '小时前'
                    }
                    else if(parseInt((nowTime - created_time)/60000) >= 1) {
                        return parseInt((nowTime - created_time)/60000) + '分钟前'
                    }
                    else{
                        return '刚刚'
                    }
                }
                card.praise = true
                card.time = handleTime(card.created_time)
                if(card.phone.slice(0,6) == 'iPhone') {
                    card.phone = card.phone.split('<')[0]
                }
                self.setData({
                    card: card,
                    loading: null
                })
            }
        })
    },
    onLoad: function(params) {
        this.getDetail(params.uuid)   
    },
    handleCommentFocus() {
        this.setData({
            handle: {
                AnonShow: true,
                AnonTemp: false
            }
        })
    }, // 评论输入框获得焦点则出现匿名选项
    handleCommentBlur() {
        let self = this
        let timer = setTimeout(() => {
            if(self.data.handle.AnonTemp == true){
                self.setData({
                    handle: {
                        AnonShow: true,
                        AnonTemp: false
                    }
                })
                clearInterval(timer)
            }  
            else {
                self.setData({
                    handle: {
                        AnonShow: false,
                        AnonTemp: false
                    }
                })
                clearInterval(timer)
            }
        },1)     
    }, // 失焦后若点击的是匿名栏则不消失，若不是则消失
    handleAnonShow() {
        this.setData({
            handle: {
                AnonShow: true,
                AnonTemp: true
            }            
        })
    }, // 若点击匿名栏依旧显示
    handlePreview() {
        wx.previewImage({
            current: '1',
            urls: [this.data.card.imgUrl]
        })
    }, // 浏览大图
    handleCommentInput(e) {
        this.setData({
            commentValue: e.detail.value
        })
    },
    handleComment() {
        this.setData({
            commentInputFocus: true
        })
    }, // 点击评论按钮则输入框获得焦点
    handleCommentConfirm(e) {
        if(e.detail.value.length >= 1) {
            let self = this
            self.setData({
                loading: 'loading'
            })
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
                url: 'https://wegdut.yoricklee.com/gdutWall/sendComment',
                method: 'POST',
                data: {
                    token: wx.getStorageSync('token'),
                    content: e.detail.value,
                    name: self.data.name,
                    uuid: self.data.card.uuid
                },
                success: (res) => {
                    let self = this
                    if(res.data.code == 200) {
                        wx.showToast({
                            title: '评论成功',
                            icon: 'success'
                        })
                        self.getDetail(self.data.card.uuid)
                        self.setData({
                            commentValue: ''
                        })
                    }
                }
            })
        }
        else {
            wx.showModal({
                title: '提示',
                content: '评论字数太少',
                showCancel: false
            })
        }
    }, // 增加评论
    handleAnon(e) {
        if(e.detail.value) {
            this.setData({
                name: '匿名用户',
                anonValue: true
            })
        }
        else {
            this.setData({
                name: null,
                anonValue: false
            })
        }
    }, // 处理匿名
    handlePraise() {
        let card = this.data.card,self = this
        if(card.praise == true) {
            wx.request({
                url: 'https://wegdut.yoricklee.com/gdutwall/like',
                method: 'POST',
                data: {
                    token: wx.getStorageSync('token'),
                    uuid: card.uuid
                },
                success: (res) => {
                    if(res.data.code == 200) { 
                        card.likeCount ++
                        card.praise = false                     
                        self.setData({
                            card: card
                        })
                    }
                }
            })
        }
    } //处理点赞
})