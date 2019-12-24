
Page({
  data: {
    loading: false,
    projectList: [],
  },
  onLoad: function (options) {
    this.getProjectList()
  },
  // 查询分享到清单广场的清单列表
  getProjectList() {
    let that = this
    wx.showNavigationBarLoading()
    that.setData({
      loading: true
    })

    wx.stopPullDownRefresh()
    wx.cloud.callFunction({
      name: 'project-list',
      data: {
        action: 'square',
      }
    })
    .then(res => {
      wx.hideNavigationBarLoading()

      that.setData({
        projectList: res.result.data,
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
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getProjectList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: '简单好用的清单小程序，省时更省心。',
      imageUrl: '/images/cover.png',
      path: '/pages/project/list'
    }
  }
})