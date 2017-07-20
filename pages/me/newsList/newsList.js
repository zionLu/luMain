Page({
    data:{
        newsList: [],
        loading: 'loading'
    },
    onLoad:function(options){
        var self = this
        wx.setNavigationBarTitle({
            title: '校内新闻'
        }) 
        wx.request({
            method: 'GET',
            url: 'https://wegdut.yoricklee.com/gdutnews',
            success: (res) => {
                let newsList = res.data.news_ifw_Accs_GetList_list1
                self.setData({
                    newsList: newsList,
                    loading: null
                })
                
            }
        })
    },
    handleNewsEntry(e) {
        wx.navigateTo({
            url: '/pages/me/newsList/news/news?title=' + e.currentTarget.dataset.title  +'&NewsRd=' + e.currentTarget.dataset.newsrd
        })
    }
})