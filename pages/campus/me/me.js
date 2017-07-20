Page({
    data: {
        userInfo: {},
        cards: null,
        praise: true,
        loading: 'loading'
    },
    onShow: function() {
        let self = this
        let start = () => {
            let promise = new Promise((resolve, reject) => {
                let timer = setInterval(() => {
                    let app = getApp()
                    if (app.data.userInfo) {
                        clearInterval(timer)
                        resolve(app)
                    }
                }, 1000)
            })
            return promise
        }
        start().then((app) => {
            self.setData({
                userInfo: app.data.userInfo
            })
            let adminList = ['ojRfq0MVXOcUuP3gb8NBqJix4GaE', 'ojRfq0IGDiuVjaLHWkzDOteY4oEE']
            let openid = wx.getStorageSync('openid')
            let url = 'https://wegdut.yoricklee.com/gdutWall/getPersonMonents'
            for (let i in adminList) {
                if (openid == adminList[i]) {
                    url = 'https://wegdut.yoricklee.com/gdutWall/getAllMonents'
                }
            } // 添加管理员可删除帖子
            wx.request({
                url: url,
                method: 'POST',
                data: {
                    token: wx.getStorageSync('token')
                },
                success: (res) => {
                    let cards = res.data.data
                    let handleTime = (created_time) => {
                        let date = new Date()
                        let nowTime = date.getTime()
                        if (parseInt((nowTime - created_time) / 2592000000) >= 1) {
                            return parseInt((nowTime - created_time) / 2592000000) + '月前'
                        } else if (parseInt((nowTime - created_time) / 86400000) >= 1) {
                            return parseInt((nowTime - created_time) / 86400000) + '天前'
                        } else if (parseInt((nowTime - created_time) / 3600000) >= 1) {
                            return parseInt((nowTime - created_time) / 3600000) + '小时前'
                        } else if (parseInt((nowTime - created_time) / 60000) >= 1) {
                            return parseInt((nowTime - created_time) / 60000) + '分钟前'
                        } else {
                            return '刚刚'
                        }
                    }
                    for (let i = 0; i < cards.length; i++) {
                        cards[i].praise = true
                        cards[i].time = handleTime(cards[i].created_time)
                        if (cards[i].phone.slice(0, 6) == 'iPhone') {
                            cards[i].phone = cards[i].phone.split('<')[0]
                        } // 剪 < 后的内容
                    }
                    self.setData({
                        cards: res.data.data,
                        loading: null
                    })
                }
            })
        })

    },
    handlePreview: function(e) {
        wx.previewImage({
            current: '1',
            urls: [e.currentTarget.dataset.src]
        })
    },
    handleCardEntry: function(e) {
        wx.navigateTo({
            url: '/pages/campus/moment/moment?uuid=' + e.currentTarget.dataset.uuid
        })
    },
    handlecardCancel: function(e) {
        let cards = this.data.cards,
            self = this
        self.setData({
            loading: 'loading'
        })
        wx.showModal({
            title: '提示',
            content: '确认删除吗？',
            success: (res) => {
                console.log(res)
                if (res.confirm) {
                    wx.request({
                        url: 'https://wegdut.yoricklee.com/gdutWall/del',
                        method: 'POST',
                        data: {
                            token: wx.getStorageSync('token'),
                            uuid: e.currentTarget.dataset.uuid
                        },
                        success: (res) => {
                            if (res.data.code == 200) {
                                for (let i = 0; i < cards.length; i++) {
                                    if (cards[i].uuid == e.currentTarget.dataset.uuid) {
                                        cards.splice(i, 1)
                                    }
                                }
                                self.setData({
                                    cards: cards,
                                    loading: null
                                })
                            }
                        }
                    })
                } else {
                    self.setData({
                        loading: null
                    })
                }
            }
        })
    },
    handlePraise: function(e) {
        let cards = this.data.cards,
            uuid = e.currentTarget.dataset.uuid,
            self = this
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].uuid == uuid && cards[i].praise == true) {
                wx.request({
                    url: 'https://wegdut.yoricklee.com/gdutwall/like',
                    method: 'POST',
                    data: {
                        token: wx.getStorageSync('token'),
                        uuid: uuid
                    },
                    success: (res) => {
                        if (res.data.code == 200) {
                            for (let i = 0; i < cards.length; i++) {
                                if (cards[i].uuid == uuid) {
                                    cards[i].likeCount++
                                        cards[i].praise = false
                                }
                            }
                            self.setData({
                                cards: cards
                            })
                        }
                    }
                })
            }
        }

    }
})