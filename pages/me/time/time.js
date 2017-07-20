Page({
    data:{
        time: null,
        loading: 'loading'
    },
    onLoad:function(options){
        let time = [],self = this
        wx.setNavigationBarTitle({
            title: '考试时间'
        })
        wx.request({
            url: 'https://wegdut.yoricklee.com/jwgl/exam',
            method: 'POST',
            data: {
                token: wx.getStorageSync('token')
            },
            success: (res) => {
                if(res.data.code == 200) {
                    time = res.data.time.rows
                    for(let i=0; i<time.length; i++) {
                        let date = new Date()
                        let nowDay = date.getTime()
                        let testDay = Date.parse(time[i].ksrq.slice(0,10))
                        let count = parseInt((testDay - nowDay)/86400000)
                        time[i].ksrq = time[i].ksrq + '　' + time[i].kssj.slice(0,5) + ' - ' + time[i].kssj.slice(10,15)
                        time[i].count = count
                    } // 考试日期
                    self.setData({
                        time: time,
                        loading: null
                    })
                }
                else {
                    time = res.data.time.rows
                    for(let i=0; i<time.length; i++) {
                        let date = new Date()
                        let nowDay = date.getTime()
                        let testDay = Date.parse(time[i].ksrq.slice(0,10))
                        let count = parseInt((testDay - nowDay)/86400000)
                        time[i].ksrq = time[i].ksrq + '　' + time[i].kssj.slice(0,5) + ' - ' + time[i].kssj.slice(10,15)
                        time[i].count = count
                    } // 考试日期
                    self.setData({
                        time: time,
                        loading: null
                    })
                }
            }
        })
    },
})