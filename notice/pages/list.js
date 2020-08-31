
Page({
  data: {
    loading: false,
    noticeList: [],
  },
  onLoad: function (options) {
    this.getNoticeList()
  },
  // 查询公告列表
  getNoticeList() {
    let that = this
    wx.showNavigationBarLoading()
    that.setData({
      loading: true
    })

    wx.stopPullDownRefresh()
    wx.cloud.callFunction({
      name: 'notice-list',
      data: {
        active: true
      }
    })
    .then(res => {
      wx.hideNavigationBarLoading()
      
      that.setData({
        noticeList: res.result.data,
        loading: false
      })
    })
    .catch(err => {
      wx.hideNavigationBarLoading()
      that.setData({
        loading: false
      })
      console.error(err)
    })

  },
  gotoNoticeDetail(event) {
    let _notice = event.currentTarget.dataset.notice
    wx.navigateTo({
      url: '/notice/pages/detail?id=' + _notice._id,
    })    
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getNoticeList()
  },

})