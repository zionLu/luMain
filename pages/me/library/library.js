Page({
    data:{
        searchValue: null,
        inputShowed: false,
        bookList: null,
        searchList: [],
        loading: null
    },
    onLoad:function() {
        this.setData({
            inputShowed: true
        });
        wx.setNavigationBarTitle({
            title: '图书馆藏'
        })
    },
    search() {
        var self = this
        self.setData({
            searchList: [],
            loading: 'loading'
        }) 
        wx.request({
            method: 'GET',
            url: 'https://wegdut.yoricklee.com/gdutlibrary/list',
            data: {
                keyword: self.data.searchValue
            },
            success:(res) => {
                self.setData({
                    loading: null,
                    bookList: res.data.data.find_ifa_FindFullPage_list1
                })
            }
        })
    },
    handleShowInput() {
        this.setData({
            inputShowed: true
        });
    },
    handleHideInput() {
        this.setData({
            searchValue: "",
            inputShowed: false,
            searchList: []
        });
    },
    handleClearInput() {
        this.setData({
            searchValue: "",
            searchList: []
        });
    },
    handleInputTyping(e) {
        let self = this
        if(e.detail.value.length == 0) {
            self.setData({
                searchValue: '',
                searchList: []
            }); 
        }
        else if(e.detail.value.length == 1) {
            self.setData({
                searchValue: e.detail.value,
                searchList: []
            }); 
        }
        else {
            wx.request({
                method: 'GET',
                url: 'https://wegdut.yoricklee.com/gdutlibrary/hotsearch',
                data: {
                    keyword: e.detail.value
                },
                success: function(res) {
                    if(res.data.length >= 10) {
                        res.data.length = 10
                    }  
                    self.setData({
                        searchValue: e.detail.value,
                        searchList: res.data
                    });                                   
                }
            })
        }              
    },
    handleSelectHot(e) {
        this.setData({
            searchValue: e.currentTarget.dataset.index
        })
        this.search()
    },
    handleBookEntry(e) {
        wx.navigateTo({
            url: '/pages/me/library/book/book?CtrlRd=' + e.currentTarget.dataset.ctrlrd + '&title=' + e.currentTarget.dataset.title + '&CtrlNo=' + e.currentTarget.dataset.ctrlno
        })
    }
})