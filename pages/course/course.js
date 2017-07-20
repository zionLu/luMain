Page({
    data:{
        weekNo: 1,
        weekDate: [],
        weekList: [],
        course: null,
        today: [],
        screen: {
            width: null,
            height: null
        },
        left: '',
        top: '',
        loading: 'loading'
    },
    methods: {
        randomColor:  {
            colors: ['#F7D94C','#DC9FB4','#E16B8C','#F4A7B9','#DB4D6D','#D05A6E','#BF6766','#EB6766','#EB7A77','#F17C67','#B9887D','#E83015','#FB966E','#F05E1C','#FC9F4D','#FFBA84','#FFB11B','#BEC23F','#90B44B','#5DAC81','#A8D8B9','#00AA90','#66BAB7','#A5DEE4','#58B2DC','#7DB9DE','#9B90C2','#B28FCE','#986DB2','#E03C8A','#DDD23B'],
            arr: [],
            color() {
                if(this.arr.length>=this.colors.length) {
                    this.arr = []
                }
                let randomNo = () => {
                    let no = parseInt(Math.random()*this.colors.length),mark = true
                    for(let i=0; i<this.arr.length; i++) {
                        if(this.arr[i] == no) {
                            mark = false
                        }
                    }
                    if(mark == true) {
                        this.arr.push(no)
                    }
                    else {
                        randomNo()
                    }
                }
                randomNo()
                return this.colors[this.arr.slice(-1)]
            }
        }, //返回一个不重复的随机色
        setCourse(self) {
            let fillColor = () => {
                let course = wx.getStorageSync('course')[self.data.weekNo]
                for(let i in course) {
                    for(let m=0; m<course[i].length; m++) {               
                        if(course[i][m].color !== null) {
                            course[i][m].color = self.methods.randomColor.color()
                        }
                    }
                }
                self.setData({
                    course: course
                })
            } // 填充颜色
            let week = () => {
                let date = new Date()            
                let m = date.getMonth() + 1;  
                m = m < 10 ? ('0' + m) : m;  
                let d = date.getDate();  
                d = d < 10 ? ('0' + d) : d;   
                let today = m + '-' + d
                console.log(today)
                let calendar = wx.getStorageSync('calendar')
                // 判断当前日期是否早于firstDay，若是，则返回第一周
                if (Date.parse(new Date()) < Date.parse(wx.getStorageSync('firstDay'))){
                    return {
                        weekNo: 1,
                        weekDate: calendar[0],
                    }
                }
                for(let i=0; i<calendar.length; i++) {
                    for(let m=0; m<calendar[i].length; m++) {
                        if(today == calendar[i][m]) {
                            return {
                                weekNo: i+1,
                                weekDate: calendar[i]
                            }
                        }
                    }
                }
            } // 返回当前周  
            let date = new Date()
            let today = date.getDay()
            if(today == 0) today = 7
            let weekDay = {
                currentTarget: {
                    dataset: {
                        value: today
                    }
                }
            }
            self.handleToday(weekDay) // 高亮今日
            let weekList = []
            if(wx.getStorageSync('weekList')){
                weekList = wx.getStorageSync('weekList')
            } 
            else {
                let calendar = wx.getStorageSync('calendar')   
                for(let i=0; i<calendar.length; i++) {
                    weekList[i] = '第' + Number(i+1) + '周'
                } // weekList
            }      
            self.setData({
                weekNo: week().weekNo,
                weekDate: week().weekDate,
                weekList: weekList
            })
            fillColor()
        }
    },
    onShow: function() {
        let self = this
        wx.getSystemInfo({
            success: (res) => {
                self.setData({
                    screen: {
                        width: res.screenWidth,
                        height: res.screenHeight - 60
                    }
                })
            }
        })
        let start = () => {
            let promise = new Promise(function(resolve,reject){
                let timer = setInterval(function() {
                    let app = getApp()
                    if(app.data.userInfo) {
                        clearInterval(timer)
                        if(wx.getStorageSync('calendar')) {
                            resolve()
                        } // 如有calendar则resolve
                        else {
                            wx.request({
                                url: 'https://wegdut.yoricklee.com/calendarNext',
                                method: 'GET',
                                success: (res) => {
                                    if(res.statusCode == 200) {
                                        wx.setStorageSync('firstDay', res.data.data.firstDay)
                                        wx.setStorageSync('calendar', res.data.data.calendar)
                                        resolve()
                                    }                      
                                }
                            })
                        } // 没有calendar，则请求calendar                
                    }
                },1000)
            })
            return promise
        }
        start().then(() => {
            if(wx.getStorageSync('course')) {
                self.methods.setCourse(self)
                self.setData({
                    loading: null
                })
            }
            else {
                wx.request({
                    url: 'https://wegdut.yoricklee.com/jwgl/course',
                    method: 'POST',
                    data: {
                        token: wx.getStorageSync('token')                    },
                    success: (res) => {  
                        let _course = res.data.data.rows,course = {},weekMax = 1
                        wx.setStorageSync('subjectNo', _course.length)
                        for(let i=0; i<_course.length; i++) {
                            if(Number(_course[i].zc) > weekMax) {
                                weekMax = _course[i].zc
                            }
                        } // 最大周数                      
                        for(let i=1; i<=20; i++) {
                            course[i] = {}
                            for(let m=1; m<8; m++) {
                                course[i][m] = []
                            }
                        } // 初始化course
                        for(let i=0; i<_course.length; i++) {
                            course[_course[i].zc][_course[i].xq].push(_course[i])
                        } // 填充数据
                        for(let i in course) {                                     
                            for(let m in course[i]) {
                                for(let t=0; t<course[i][m].length; t++) {
                                    course[i][m][t].jxcdmc = '@ '+ course[i][m][t].jxcdmc
                                    course[i][m][t].pkrq = course[i][m][t].pkrq.slice(5,10) // 初始化日期
                                    course[i][m][t].flex = course[i][m][t].jcdm.length/2 // 初始化长度
                                    course[i][m][t].start = Number(course[i][m][t].jcdm.slice(0,2)) // 初始化位置
                                    if(course[i][m][t].kcmc.length > 6) {
                                        course[i][m][t].kcmc = course[i][m][t].kcmc.slice(0,5)+'…'
                                    } // 课程名过长则切掉
                                }
                            }
                        } 
                        for(let i in course) {                                     
                            for(let m in course[i]) {
                                for(let t=0; t<course[i][m].length; t++) {
                                    for(let j=t; j<course[i][m].length; j++) {
                                        if(course[i][m][t].start > course[i][m][j].start) {
                                            let temp = course[i][m][t]
                                            course[i][m][t] = course[i][m][j]
                                            course[i][m][j] = temp
                                        }
                                    } 
                                }
                            }
                        } // 课程排序
                        let blank = {
                            creatNew: function() {
                                let blank = {
                                    color: null
                                }
                                return blank
                            }
                        } // 定义空白块          
                        for(let i in course) {  
                            for(let m in course[i]) {
                                if(course[i][m].length == 0) {
                                    let _blank = blank.creatNew()
                                    _blank.flex = 12
                                    course[i][m].splice(0,0,_blank)
                                } // 当天没有课
                                else {
                                    for(let t=0; t<course[i][m].length; t++) {
                                        if(t==0 && course[i][m][0].start != 1) {
                                            let _blank = blank.creatNew()
                                            _blank.flex = course[i][m][0].start - 1
                                            course[i][m].splice(0,0,_blank)                                    
                                        } // 第一节课之前有空白
                                        else if(t!=0 && course[i][m][t-1].start+course[i][m][t-1].flex < course[i][m][t].start) {                                    
                                            let _blank = blank.creatNew()
                                            _blank.flex = course[i][m][t].start-course[i][m][t-1].start-course[i][m][t-1].flex
                                            course[i][m].splice(t,0,_blank) 
                                        } // 两节课之间有空白                             
                                    } 
                                    // 最后一节课之后有空白 
                                    let _blank = blank.creatNew()
                                    let max = course[i][m].length - 1
                                    _blank.flex =  13 - course[i][m][max].start - course[i][m][max].flex
                                    course[i][m].push(_blank)
                                }                            
                            }                            
                        } 
                        wx.setStorageSync('course', course)
                        self.methods.setCourse(self)
                        self.setData({
                            loading: null
                        })
                    }
                })
            }
        })     
    },
    handleToday(e) {
        let today = []
        for(let i=0; i<7; i++){
            if(e.currentTarget.dataset.value-1 == i){
                today[i]={}
                today[i].flex = 1.5
                today[i].color = 'select'
            }
            else {
                today[i]={}
                today[i].flex = 1
            }
        }
        this.setData({
            today: today
        })
    }, // 点击变宽
    handleWeek(e) {
        let index = Number(e.detail.value),course = null
        if(index+1 in wx.getStorageSync('course')){
            course = wx.getStorageSync('course')[index+1]
            for(let i in course) {
                for(let m=0; m<course[i].length; m++) {               
                    if(course[i][m].color !== null) {
                        course[i][m].color = this.methods.randomColor.color()
                    }
                }
            }
        }
        this.setData({
            weekNo: index + 1,
            course: course,
            weekDate: wx.getStorageSync('calendar')[index]
        })
    }, // 选择第几周
    handleIndexMove(e) {      
        if(e.touches[0].clientX < 25) {
            e.touches[0].clientX = 25
        }
        else if(e.touches[0].clientX > this.data.screen.width - 25) {
            e.touches[0].clientX = this.data.screen.width - 25
        }
        if(e.touches[0].clientY < 25) {
            e.touches[0].clientY = 25
        }
        else if(e.touches[0].clientY > this.data.screen.height - 75) {
            e.touches[0].clientY = this.data.screen.height - 75
        }
        this.setData({
            left: e.touches[0].clientX - 25,
            top: e.touches[0].clientY - 25
        })
    },
    onShareAppMessage() {
        let subjectNo = wx.getStorageSync('subjectNo')
        let price = parseInt(2850/subjectNo)
        return {
            title: '我这学期共' + subjectNo + '节课,每节课' + price + '元,来看看你的吧！',
            path: '/pages/course/course'
        }
    }
})
