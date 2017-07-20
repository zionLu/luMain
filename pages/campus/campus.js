
var cards=[];
Page({
    data:{
        dataFlag:false,
        userInfo: {},
        cards: [],
        praise: true,
        loading: 'loading',
        hideAfter: 'hide',
        refresh:'',
        mov: {
            x: 40,
            y: 100
        },
    },
    request() { 
        let self = this;
        self.dataFlag = true;
        wx.request({
            url: 'https://wegdut.yoricklee.com/gdutWall/testgetAllMonents',
            method: 'POST',
            data: {
              time: (cards.length)?cards[cards.length-1].created_time:'',
                token: wx.getStorageSync('token')
            },
            success: (res) => {
             cards = cards.concat(res.data.data)
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
                for(let i=0; i<cards.length; i++) {
                    cards[i].praise = true
                    cards[i].time = handleTime(cards[i].created_time)
                    if(cards[i].phone.slice(0,6) == 'iPhone') {
                        cards[i].phone = cards[i].phone.split('<')[0]
                    } // 剪 < 后的内容
                }
                self.setData({
                  cards: cards,
                  loading: null,
                  hideAfter: 'hide',
                })
                //wx.stopPullDownRefresh()
                self.dataFlag=false;
            }
        })
    },
  //刷新页面
    refresh:function(e){
      let self = this
      self.setData({
        refresh: '1',
        hideAfter: '',
      })
      if (self.dataFlag) return;
      cards = [];
      self.request();
      setTimeout(function() {
        self.setData({
          refresh: '',
        })},800)
    },
    //加载更多
    loadMoer:function(e){
      let self = this;
      if (self.dataFlag) return;
      self.setData({
        hideAfter: '',
      })
      self.request();
    },
    //返回cards页
    retureFrist(){
      let self = this
      self.setData({
        cards: cards,
        loading: null,
        hide: 'hide',
      })
    },
    onLoad(e) {
        let self = this
        wx.getSystemInfo({
            success(res) {
                console.log(res.screenWidth,res.screenHeight)
                self.setData({
                    mov: {
                        x: res.screenWidth - 80,
                        y: res.screenHeight - 200
                    }
                })
            },
        })
    },
    onShow() {
        let self = this
        if (self.dataFlag) return;
        let start = () => {
            let promise = new Promise((resolve,reject) => {
                let timer = setInterval(() => {
                    let app = getApp()
                    if(app.data.userInfo) {
                        clearInterval(timer)
                        resolve(app)
                    }
                },1000)
            })
            return promise
        }
        start().then((app) => {
            self.setData({
                userInfo: app.data.userInfo
            })
            if (cards.length>20)self.retureFrist();
           else self.request();
        })       
    },
    handlePreview(e) {
        wx.previewImage({
            current: '1',
            urls: [e.currentTarget.dataset.src]
        })
    }, // 浏览大图
    handleMe() {
        wx.navigateTo({
            url: '/pages/campus/me/me'
        })
    },
    handleAdd() {
        wx.navigateTo({
            url: '/pages/campus/add/add'
        })
    },
    handleCardEntry(e) {
        wx.navigateTo({
            url: '/pages/campus/moment/moment?uuid=' + e.currentTarget.dataset.uuid
        }) // 带参跳转
    },
    handlePraise(e) {
        let cards = this.data.cards,uuid = e.currentTarget.dataset.uuid,self = this
        for(let i=0; i<cards.length; i++) {
            if(cards[i].uuid == uuid && cards[i].praise == true) {
                wx.request({
                    url: 'https://wegdut.yoricklee.com/gdutwall/like',
                    method: 'POST',
                    data: {
                        token: wx.getStorageSync('token'),
                        uuid: uuid
                    },
                    success: (res) => {
                        if(res.data.code == 200) {
                            for(let i=0; i<cards.length; i++) {
                                if(cards[i].uuid == uuid) {
                                    cards[i].likeCount ++
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
    }, // 处理点赞 
    onPullDownRefresh() {
        this.request()
    }
})