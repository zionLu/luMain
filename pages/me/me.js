
Page({
  data: {
    tutorial: false,
    animationData: {}
  },
  onLoad: function (options) {

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭 
  },
  showTutorial() {
    this.setData({
      tutorial: true
    })
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    this.animation = animation

    animation.opacity(1).step()

    this.setData({
      animationData: animation.export()
    })
  },
 closeTutorial() {
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    let tween = new Promise((reslove,reject)=>{
      this.animation = animation
      animation.opacity(0).step()
      this.setData({
        animationData: animation.export()
      })
      setTimeout(reslove,1000)
    }).then(()=>{
     
      this.setData({
        tutorial: false
      })
    })
   
  
  
  }
})