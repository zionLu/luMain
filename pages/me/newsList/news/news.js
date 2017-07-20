Page({
  data:{
      news: null,
      loading: 'loading'
  },
  onLoad: function(params) {
      let self = this, news
      wx.request({
          method: 'GET',
          url: 'https://wegdut.yoricklee.com/gdutnews/detail',
          data: {
            NewsRd: params.NewsRd
          },
          success: (res) => {  
              news = res.data   
              wx.setNavigationBarTitle({
                  title: params.title
              })
              news = news.match(/<p[^>]*>[\s\S]*?<\/[^>]*p>/gi)
              for(let i=0; i<news.length; i++) {
                  news[i] = news[i].slice(3,-4)
              }
              for(let i=0; i<news.length; i++) {
                  let text = news[i].slice(0,4)
                  if(text == '<img') {
                      news[i] = {
                          mark: 'image',
                          content: news[i].slice(30,-4)
                      }
                  }
                  else if(i>=news.length-2) {
                      news[i] = {
                          mark: 'footer',
                          content: '　　'+news[i]
                      }
                  }
                  else {
                      news[i] = {
                          mark: 'text',
                          content: '　　'+news[i]
                      }
                  }
              }  
              self.setData({
                  news: news,
                  loading: null             
              })        
          }        
      })
  },

})