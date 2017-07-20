Page({
    data: {
        tabs: ["书目", "简介", "目录", "馆藏"],
        CtrlRd: null,
        CtrlNo: null,
        current: 0,
        sliderOffset: 0,
        info: null,
        intro: null,
        contents: null,
        site: null,
        offsetLeft: null,
        arrX: [],  
        loading: 'loading'    
    },
    onLoad: function (data) {   
        let image,info,_info=[],intro,contents,self = this
        wx.getSystemInfo({
            success: function(data) {
                self.setData({
                    offsetLeft: data.screenWidth/4
                })
            }
        })
        wx.setNavigationBarTitle({
            title: data.title
        })   
        let btoa =(input) => {
            var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = _keyStr.indexOf(input.charAt(i++));
                enc2 = _keyStr.indexOf(input.charAt(i++));
                enc3 = _keyStr.indexOf(input.charAt(i++));
                enc4 = _keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = toUtf8(output);
            return output;
            function toUtf8(utftext) {
                var string = ""
                var i = 0
                var c = 0, c1 = 0, c2 = 0, c3 = 0
                while ( i < utftext.length ) {
                    c = utftext.charCodeAt(i);
                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    } else if((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i+1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    } else {
                        c2 = utftext.charCodeAt(i+1);
                        c3 = utftext.charCodeAt(i+2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }
                }
                return string;
            }
        }
        self.setData({
            CtrlRd: data.CtrlRd,
            CtrlNo: data.CtrlNo
        })
        wx.request({
            method: 'GET',
            url: 'https://wegdut.yoricklee.com/gdutlibrary/detail',
            data: {
                CtrlRd: data.CtrlRd,
                CtrlNo: data.CtrlNo
            },
            success:(res) => {                             
                let handleInfo = () => {
                    info = btoa(res.data.DetailInfo)
                    image = info.match(/<center[^>]*>[\s\S]*?<\/[^>]*center>/gi)
                    image = image[0].slice(18,-11) 
                    self.setData({
                        image: image
                    })  
                    info = info.match(/<td[^>]*>[\s\S]*?<\/[^>]*td>/gi)
                    for(let i=0; i<info.length; i++) {
                        info[i] = info[i].slice(4,-5)
                    }
                    for(let i=0; i<info.length; i++) {
                        if(info[i] == '书名') {
                            if(info[i+1].length > 10) {
                                _info[0] = info[i+1].slice(0,10) + '…'
                            }
                            else {
                                _info[0] = info[i+1]
                            }
                        }
                        if(info[i] == '作者') {
                            _info[1] = info[i+1]
                        }
                        if(info[i] == '价格') {
                            _info[2] = info[i+1]
                        }
                        if(info[i] == '出版社') {
                            _info[3] = info[i+1]
                        }
                        if(info[i] == 'ISBN') {
                            _info[4] = info[i+1]
                        }              
                    }
                    self.setData({
                        info: _info
                    })
                    console.log(self.data.info)
                }  
                let handleIntro = () => {
                    intro = '　　' + res.data.DetailIntro
                    self.setData({
                        intro: intro
                    })
                } 
                let handleContents = () => {
                    contents = btoa(res.data.DetailContents)
                    contents = contents.slice(14)
                    console.log(contents.search(/<p>/i))
                    if(contents.search(/<p>/i) == 0) {
                        contents = contents.slice(3,-5)
                    }
                    
                    if(contents.search(/<br>/i) == -1){
                        contents = contents.split('<br />')
                    }
                    else {
                        contents = contents.split('<br>')
                    }  
                    for(let i=0; i<contents.length; i++) {
                        if(contents[i].search(/(\\n)/i) != -1) {
                            contents[i] = contents[i].slice(0,-2)
                        }
                    }          
                    self.setData({
                        contents: contents
                    })
                }
                let handleSite = () => {
                    self.setData({
                        site: res.data.DetailCollection
                    })                
                }        
                handleInfo()
                handleIntro() 
                handleContents()
                handleSite()  
                self.setData({
                    loading: null
                })       
            }
        })
    },
    handleTabClick(e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            current: e.currentTarget.id
        });
    },
    handleSwiper(e) {
        this.setData({
            sliderOffset: this.data.offsetLeft * Number(e.detail.current)
        })
    },
    onShareAppMessage() {
        let bookName = this.data.info[0]
        let CtrlRd = this.data.CtrlRd
        let CtrlNo = this.data.CtrlNo
        return {
            title: '《' + bookName + '》这本书推荐给你！',
            path: '/pages/me/library/book/book?CtrlRd=' + CtrlRd  + '&title=好友推荐'  + '&CtrlNo=' + CtrlNo
        }
    }
});