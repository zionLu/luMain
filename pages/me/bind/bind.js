Page({
    data:{
        id: null,
        password: null,
        verifyCode: null,//新增，验证码
        verifyImgURL: null,//验证码图的url
        verifyCookie:null,//当前验证的cookie（cookie在提交时与IP，password，verifyCode一并提交
        warnVisible: false
    },
    onLoad: function(){
        let self = this
        wx.setNavigationBarTitle({
            title: '绑定学号'
        })
        // 请求验证码url与cookie，并写入data
        wx.request({
          url: "https://wegdut.yoricklee.com/jwgl/sendYzm",
          data:{},
          method: "GET",
          success: (res)=>{
            self.setData({
              verifyImgURL:res.data.data.url,
              verifyCookie:res.data.data.cookie[0]
            })
          }
        })
    },
    // 重新请求一张验证码图片(附cookie)
    requestAnotherVerify(){
      wx.request({
        url: "https://wegdut.yoricklee.com/jwgl/sendYzm",
        data: {},
        method: "GET",
        success: (res) => {
          this.setData({
            verifyImgURL: res.data.data.url,
            verifyCookie: res.data.data.cookie[0]
          })
        }
      })
    },
    handleIdInput(e) {
        this.data.id = Number(e.detail.value)
        if(e.detail.cursor == 10){
            this.setData({
                  warnVisible: false
            })
        }
    },
    handlePasswordInput(e) {
        let id = String(this.data.id)
        if(id.length == 10) {
            this.setData({
                  warnVisible: false
            })
        }
        else {
            this.setData({
                warnVisible: true
            })
        }
        this.data.password = e.detail.value      
    },
    //验证码input
    handleVerifyCodeInput(e) {
      this.data.verifyCode = e.detail.value
      if (e.detail.cursor == 4) {
        this.setData({
          warnVisible: false
        })
      }
    },
    handleBind() {
        let self = this
        let token = wx.getStorageSync('token')
        if(token&& this.data.id && this.data.password) {
            wx.showLoading({
                title: '绑定中...',
                mask: true
            })
            wx.request({
              // 教务系统登录 post 参数 username && password && yzm && cookie 返回200 成功 500 登录失败 402 缺少参数
              url: 'https://wegdut.yoricklee.com/jwgl/login',
              data: {
                  // token: token,
                  username: this.data.id,
                  password: this.data.password,
                  yzm: this.data.verifyCode,
                  cookie: this.data.verifyCookie
              },
              method: 'POST', 
              success: (res) => {
                  console.log(res)
                  wx.hideLoading() 
                  if(res.data.code == 200) {              
                      wx.showModal({
                          title: '提示',
                          content: '绑定成功',
                          showCancel: false,
                          success: () => {
                              wx.clearStorageSync()
                              wx.setStorageSync('token', res.data.data.token)//改动
                              wx.switchTab({
                                url: '/pages/course/course'
                              })                     
                          }
                      })                  
                  } 
                  else if(res.data.code == 401) {   
                      wx.showModal({
                          title: '提示',
                          content: 'token非法，请重新授权',
                          showCancel: false
                      })  
                  } // token非法
                  else if(res.data.code == 404) {
                      wx.showModal({
                          title: '提示',
                          content: '请重新授权',
                          showCancel: false
                      })
                  } // 缺少token
                  else if(res.data.code == 500) {
                      // requestAnotherVerify()
                      wx.showModal({
                          title: '提示',
                          content: '学号,密码或验证码错误',
                          showCancel: false,
                          success: () => {
                              self.setData({
                                  password: ''
                              })
                          }
                      }) 
                      self.requestAnotherVerify()               
                  } // 账号密码错误
                  else if(res.data.code == 505) {
                      wx.showModal({
                          title: '提示',
                          content: '该学号已被绑定',
                          showCancel: false
                      })
                  } // 已经绑定
              }
            })
        }
        else {
            wx.showModal({
                title: '提示',
                content: '请输入信息或重新授权',
                showCancel: false
            })
        }
    }
})
